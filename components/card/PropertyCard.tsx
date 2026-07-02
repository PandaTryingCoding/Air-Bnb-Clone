import React from "react";
import Link from "next/link";
import CountryFlagAndName from "./CountryFlagAndName";
import PropertyRating from "./PropertyRating";
import FavouriteToggleButton from "./FavouriteToggleButton";
import PropertyCardCarousel from "./PropertyCardCarousel";
import { PropertyCardProps } from "@/utils/types";
import { formatCurrency } from "@/utils/format";

function PropertyCard({ property }: { property: PropertyCardProps }) {
  const { name, images, price } = property;
  const { country, id: propertyId, tagline } = property;
  return (
    <article className='group relative'>
      <div className='relative mb-2'>
        <PropertyCardCarousel
          images={images}
          name={name}
          propertyId={propertyId}
        />
        <div className='absolute top-5 right-5 z-10'>
          <FavouriteToggleButton propertyId={propertyId} />
        </div>
      </div>
      <Link href={`/properties/${propertyId}`}>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold mt-1'>
            {name.substring(0, 30)}
          </h3>
          {/* property rating */}
          <PropertyRating inPage={false} propertyId={propertyId} />
        </div>
        <p className='text-sm mt-1 text-muted-foreground'>
          {tagline.substring(0, 40)}
        </p>
        <div className='flex justify-between items-center mt-1'>
          <p className='text-sm mt-1'>
            <span className='font-semibold '>{formatCurrency(price)}</span> /
            night
          </p>
          {/* country and flag */}
          <CountryFlagAndName countryCode={country} />
        </div>
      </Link>
    </article>
  );
}

export default PropertyCard;
