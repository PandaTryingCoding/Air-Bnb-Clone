"use server";

import {
  createReviewSchema,
  imageSchema,
  profileSchema,
  propertyImagesSchema,
  propertySchema,
  validateWithZodSchema,
} from "./schemas";
import db from "./db";
import { clerkClient, currentUser, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteImage, uploadImage } from "./supabase";
import { MAX_PROPERTY_IMAGES } from "./schemas";
import Rating from "@/components/reviews/Rating";
import { calculateTotals } from "./calculateTotals";
import { formatDate } from "./format";
import { getMinCheckInForActiveHold, isPendingHoldActive } from "./bookingHold";

type ProfileImageResult = string | { message: string } | undefined | null;

const cleanupExpiredPendingBookings = async () => {
  const minCheckIn = getMinCheckInForActiveHold();
  await db.booking.deleteMany({
    where: {
      paymentStatus: false,
      checkIn: { lt: minCheckIn },
    },
  });
};

const renderError = (error: unknown): { message: string } => {
  return {
    message: error instanceof Error ? error.message : "There was an error!",
  };
};

export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/");
  }

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      clerkId: true,
    },
  });

  if (!profile) {
    redirect("/profile/create");
  }

  return user;
};

const getAdminUser = async () => {
  const user = await getAuthUser();
  if (user.id !== process.env.ADMIN_USER_ID) redirect("/");
  return user;
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData,
) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Please login to create a new Profile!");

    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl ?? "",
        ...validatedFields,
      },
    });

    if (!user.privateMetadata.hasProfile) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          hasProfile: true,
        },
      });
    }
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProfileImage = async (): Promise<ProfileImageResult> => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const profile = await db.profile.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        profileImage: true,
      },
    });
    return profile?.profileImage;
  } catch (error) {
    return renderError(error);
  }
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect("/profile/create");
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: validatedFields,
    });
    revalidatePath("/profile");
    return { message: "Profile Updated Successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/profile");
    return { message: "Profile Image Updated Successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const createPropertyAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const files = (formData.getAll("images") as File[]).filter(
      (file) => file.size > 0,
    );

    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    const validatedFiles = validateWithZodSchema(propertyImagesSchema, {
      images: files,
    });

    const uploadedUrls = await Promise.all(
      validatedFiles.images.map((image) => uploadImage(image)),
    );

    await db.property.create({
      data: {
        ...validatedFields,
        image: uploadedUrls[0],
        profileId: user.id,
        images: {
          create: uploadedUrls.map((url, order) => ({ url, order })),
        },
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProperties = async ({
  search = "",
  category,
}: {
  search?: string;
  category?: string;
}) => {
  const properties = await db.property.findMany({
    where: {
      category,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { tagline: { contains: search, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      image: true,
      tagline: true,
      country: true,
      price: true,
      images: {
        select: {
          url: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return properties.map((property) => ({
    id: property.id,
    name: property.name,
    tagline: property.tagline,
    country: property.country,
    price: property.price,
    images:
      property.images.length > 0
        ? property.images.map((image) => image.url)
        : [property.image],
  }));
};

export const fetchFavouriteId = async ({
  propertyId,
}: {
  propertyId: string;
}) => {
  const user = await getAuthUser();
  const favourite = await db.favorite.findFirst({
    where: {
      propertyId,
      profileId: user.id,
    },
    select: {
      id: true,
    },
  });
  return favourite?.id || null;
};

export const toggleFavouriteAction = async (prevState: {
  propertyId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const user = await getAuthUser();
  const { propertyId, favoriteId, pathname } = prevState;
  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          propertyId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return {
      message: favoriteId ? "Removed from Favourites" : "Added to Favourites",
    };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favorite.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      property: {
        select: {
          id: true,
          name: true,
          tagline: true,
          country: true,
          price: true,
          image: true,
          images: {
            select: {
              url: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });
  return favorites.map((favorite) => ({
    id: favorite.property.id,
    name: favorite.property.name,
    tagline: favorite.property.tagline,
    country: favorite.property.country,
    price: favorite.property.price,
    images:
      favorite.property.images.length > 0
        ? favorite.property.images.map((image) => image.url)
        : [favorite.property.image],
  }));
};

export const fetchPropertyDetails = async (id: string) => {
  const property = await db.property.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
      bookings: {
        where: {
          OR: [
            { paymentStatus: true },
            {
              paymentStatus: false,
              checkIn: { gte: getMinCheckInForActiveHold() },
            },
          ],
        },
        select: {
          checkIn: true,
          checkOut: true,
        },
      },
      images: {
        select: {
          url: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!property) return null;

  return {
    ...property,
    images:
      property.images.length > 0
        ? property.images.map((image) => image.url)
        : [property.image],
  };
};

export const createReviewAction = async (
  prevState: any,
  formData: FormData,
) => {
  const user = await getAuthUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(createReviewSchema, rawData);
    await db.review.create({
      data: {
        ...validatedFields,
        profileId: user.id,
      },
    });
    revalidatePath(`/properties/${validatedFields.propertyId}`);
    return { message: "Review Submitted Successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchPropertyReviews = async (propertyId: string) => {
  const reviews = await db.review.findMany({
    where: {
      propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      profile: {
        select: {
          firstName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return reviews;
};

export const fetchPropertyReviewsByUser = async () => {
  const user = await getAuthUser();
  const reviews = await db.review.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      property: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });
  return reviews;
};

export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();
  try {
    await db.review.delete({
      where: {
        id: reviewId,
        profileId: user.id,
      },
    });
    revalidatePath("/reviews");
    return { message: "Review Deleted Successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export async function fetchPropertyRating(propertyId: string) {
  const result = await db.review.groupBy({
    by: ["propertyId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      propertyId,
    },
  });
  return {
    rating: result[0]?._avg.rating?.toFixed() ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
}

export const findExistingReview = async (
  userId: string,
  propertyId: string,
) => {
  return db.review.findFirst({
    where: {
      profileId: userId,
      propertyId: propertyId,
    },
  });
};

export const createBookingAction = async (prevState: {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
}) => {
  const user = await getAuthUser();
  const { propertyId, checkIn, checkOut } = prevState;
  const property = await db.property.findUnique({
    where: { id: propertyId },
    select: { price: true },
  });
  if (!property) {
    return { message: "Property Not Found" };
  }

  if (!isPendingHoldActive(checkIn)) {
    return {
      message:
        "Please choose a check-in date at least 4 days from today so payment can be completed in time.",
    };
  }

  const { orderTotal, totalNights } = calculateTotals({
    checkIn,
    checkOut,
    price: property.price,
  });

  await cleanupExpiredPendingBookings();

  await db.booking.deleteMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
    },
  });

  let bookingId: string | null = null;

  try {
    const booking = await db.booking.create({
      data: {
        checkIn,
        checkOut,
        orderTotal: Math.round(orderTotal),
        totalNights,
        profileId: user.id,
        propertyId,
      },
    });
    bookingId = booking.id;
  } catch (error) {
    return renderError(error);
  }

  redirect(`/checkout?bookingId=${bookingId}`);
};

export const fetchCheckoutBooking = async (bookingId: string) => {
  const user = await getAuthUser();

  // Clean up other expired holds, but never delete the booking being checked out.
  const minCheckIn = getMinCheckInForActiveHold();
  await db.booking.deleteMany({
    where: {
      paymentStatus: false,
      checkIn: { lt: minCheckIn },
      NOT: { id: bookingId },
    },
  });

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      profileId: user.id,
      paymentStatus: false,
    },
    include: {
      property: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  return {
    propertyName: booking.property.name,
    totalNights: booking.totalNights,
    checkIn: formatDate(booking.checkIn),
    checkOut: formatDate(booking.checkOut),
    orderTotal: booking.orderTotal,
  };
};

export const fetchPendingBookings = async () => {
  const user = await getAuthUser();
  await cleanupExpiredPendingBookings();

  const minCheckIn = getMinCheckInForActiveHold();

  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id,
      paymentStatus: false,
      checkIn: { gte: minCheckIn },
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookings;
};

export const fetchBookings = async () => {
  const user = await getAuthUser();
  await cleanupExpiredPendingBookings();

  const bookings = await db.booking.findMany({
    where: {
      profileId: user.id,
      paymentStatus: true,
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          country: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookings;
};

export const deleteBookingAction = async (prevState: { bookingId: string }) => {
  const { bookingId } = prevState;
  const user = await getAuthUser();
  try {
    const result = await db.booking.delete({
      where: {
        id: bookingId,
        profileId: user.id,
      },
    });
    revalidatePath("/bookings");
    return { message: "Booking Deleted Successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchRentals = async () => {
  const user = await getAuthUser();
  const rentals = await db.property.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  const rentalsWithBookings = await Promise.all(
    rentals.map(async (rental) => {
      const totalNightSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          totalNights: true,
        },
      });
      const orderTotalSum = await db.booking.aggregate({
        where: {
          propertyId: rental.id,
          paymentStatus: true,
        },
        _sum: {
          orderTotal: true,
        },
      });
      return {
        ...rental,
        totalNightSum: totalNightSum._sum.totalNights,
        orderTotalSum: orderTotalSum._sum.orderTotal,
      };
    }),
  );
  return rentalsWithBookings;
};

export const deleteRentalAction = async (prevState: { propertyId: string }) => {
  const { propertyId } = prevState;
  const user = await getAuthUser();
  try {
    await db.property.delete({
      where: {
        id: propertyId,
        profileId: user.id,
      },
    });
    revalidatePath("/rentals");
    return { message: "Rental deleted successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchRentalDetails = async (propertyId: string) => {
  const user = await getAuthUser();
  const property = await db.property.findUnique({
    where: {
      id: propertyId,
      profileId: user.id,
    },
    include: {
      images: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!property) return null;

  if (property.images.length === 0 && property.image) {
    const backfilled = await db.propertyImage.create({
      data: {
        propertyId: property.id,
        url: property.image,
        order: 0,
      },
    });

    return {
      ...property,
      images: [backfilled],
    };
  }

  return property;
};

export const updatePropertyAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("id") as string;
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(propertySchema, rawData);
    await db.property.update({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      data: {
        ...validatedFields,
      },
    });
    revalidatePath(`/rentals/${propertyId}/edit`);
    return { message: "Property Update Successful!" };
  } catch (error) {
    return renderError(error);
  }
};

export const deletePropertyImageAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("propertyId") as string;
  const imageId = formData.get("imageId") as string;

  try {
    const property = await db.property.findUnique({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!property) {
      throw new Error("Property not found.");
    }

    if (property.images.length <= 1) {
      throw new Error("At least one image is required.");
    }

    const image = property.images.find((item) => item.id === imageId);
    if (!image) {
      throw new Error("Image not found.");
    }

    await db.propertyImage.delete({
      where: {
        id: imageId,
      },
    });

    const remaining = property.images.filter((item) => item.id !== imageId);

    await db.$transaction(async (tx) => {
      for (let i = 0; i < remaining.length; i++) {
        await tx.propertyImage.update({
          where: {
            id: remaining[i].id,
          },
          data: {
            order: i + 1000,
          },
        });
      }

      for (let i = 0; i < remaining.length; i++) {
        await tx.propertyImage.update({
          where: {
            id: remaining[i].id,
          },
          data: {
            order: i,
          },
        });
      }
    });

    if (image.order === 0 || property.image === image.url) {
      await db.property.update({
        where: {
          id: propertyId,
        },
        data: {
          image: remaining[0].url,
        },
      });
    }

    await deleteImage(image.url);
    revalidatePath(`/rentals/${propertyId}/edit`);
    revalidatePath(`/properties/${propertyId}`);
    return { message: "Image deleted successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const addPropertyImagesAction = async (
  prevState: any,
  formData: FormData,
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  const propertyId = formData.get("propertyId") as string;

  try {
    const property = await db.property.findUnique({
      where: {
        id: propertyId,
        profileId: user.id,
      },
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
    });

    if (!property) {
      throw new Error("Property not found.");
    }

    const existingCount = property._count.images;
    const remainingSlots = MAX_PROPERTY_IMAGES - existingCount;

    if (remainingSlots <= 0) {
      throw new Error(`You can upload up to ${MAX_PROPERTY_IMAGES} images.`);
    }

    const files = (formData.getAll("images") as File[]).filter(
      (file) => file.size > 0,
    );

    if (files.length === 0) {
      throw new Error("Select at least one image.");
    }

    if (files.length > remainingSlots) {
      throw new Error(`You can only add ${remainingSlots} more image(s).`);
    }

    const validatedFiles = validateWithZodSchema(propertyImagesSchema, {
      images: files,
    });

    const uploadedUrls = await Promise.all(
      validatedFiles.images.map((file) => uploadImage(file)),
    );

    await db.propertyImage.createMany({
      data: uploadedUrls.map((url, index) => ({
        propertyId,
        url,
        order: existingCount + index,
      })),
    });

    revalidatePath(`/rentals/${propertyId}/edit`);
    revalidatePath(`/properties/${propertyId}`);
    return { message: "Images added successfully!" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchReservations = async () => {
  const user = await getAuthUser();
  await cleanupExpiredPendingBookings();

  const minCheckIn = getMinCheckInForActiveHold();

  const reservations = await db.booking.findMany({
    where: {
      property: {
        profileId: user.id,
      },
      OR: [
        { paymentStatus: true },
        {
          paymentStatus: false,
          checkIn: { gte: minCheckIn },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      property: {
        select: {
          id: true,
          name: true,
          price: true,
          country: true,
        },
      },
    },
  });
  return reservations;
};

export const fetchStats = async () => {
  await getAdminUser();

  const userCount = await db.profile.count();
  const propertiesCount = await db.property.count();
  const bookingsCount = await db.booking.count({
    where: {
      paymentStatus: true,
    },
  });

  return { userCount, propertiesCount, bookingsCount };
};

export const fetchChartsData = async () => {
  await getAdminUser();
  const date = new Date();
  date.setMonth(date.getMonth() - 12);
  const twelveMonthsAgo = date;

  const bookings = await db.booking.findMany({
    where: {
      paymentStatus: true,
      createdAt: {
        gte: twelveMonthsAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const bookingsPerMonth = bookings.reduce(
    (total, current) => {
      const date = formatDate(current.createdAt, true);
      const existingEntry = total.find((entry) => entry.date === date);
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        total.push({ date, count: 1 });
      }
      return total;
    },
    [] as Array<{ date: string; count: number }>,
  );
  return bookingsPerMonth;
};

export const fetchReservationStats = async () => {
  const user = await getAuthUser();
  const properties = await db.property.count({
    where: {
      profileId: user.id,
    },
  });

  const totals = await db.booking.aggregate({
    _sum: {
      orderTotal: true,
      totalNights: true,
    },
    where: {
      paymentStatus: true,
      property: {
        profileId: user.id,
      },
    },
  });

  return {
    properties,
    nights: totals._sum.totalNights || 0,
    amount: totals._sum.orderTotal || 0,
  };
};
