"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { BsGrid3X3Gap } from "react-icons/bs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pickLayout } from "./bentoLayouts";

type ImageContainerProps = {
  images: string[];
  name: string;
};

function ImageContainer({ images, name }: ImageContainerProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const layout = useMemo(() => pickLayout(images.length), [images.length]);
  const hasMorePhotos = images.length > 5;
  const extraPhotoCount = images.length - 5;
  const lastSlotIndex = layout.slots.length - 1;

  const showAllPhotosButtonClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "gap-2 font-semibold shadow-md backdrop-blur-sm bg-background/95"
  );

  const markImageLoaded = (imageIndex: number) => {
    setLoadedImages((prev) => {
      if (prev.has(imageIndex)) return prev;
      const next = new Set(prev);
      next.add(imageIndex);
      return next;
    });
  };

  if (images.length === 1) {
    const isLoaded = loadedImages.has(0);

    return (
      <section className='relative mt-8'>
        <div className='relative h-[300px] overflow-hidden rounded-xl md:h-[500px]'>
          {!isLoaded && <Skeleton className='absolute inset-0' />}
          <Image
            src={images[0]}
            fill
            sizes='100vw'
            alt={name}
            className={`object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            priority
            onLoad={() => markImageLoaded(0)}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Desktop bento grid */}
      <section className='relative mt-8 hidden md:block'>
        <div
          className={`grid gap-2 overflow-hidden rounded-xl ${layout.gridClass}`}
        >
          {layout.slots.map((slot, slotIndex) => {
            const image = images[slot.imageIndex];
            if (!image) return null;

            const isCover = slot.imageIndex === 0;
            const isLoaded = loadedImages.has(slot.imageIndex);
            const showMoreOverlay = hasMorePhotos && slotIndex === lastSlotIndex;

            return (
              <button
                key={`${layout.id}-${slot.imageIndex}`}
                type='button'
                onClick={() => setShowGallery(true)}
                className={`group relative h-full min-h-0 w-full overflow-hidden bg-muted ${slot.className}`}
              >
                {!isLoaded && (
                  <Skeleton className='absolute inset-0 z-10 rounded-none' />
                )}
                <Image
                  src={image}
                  fill
                  sizes={
                    isCover
                      ? "(max-width: 768px) 100vw, 60vw"
                      : "(max-width: 768px) 50vw, 20vw"
                  }
                  alt={`${name} - image ${slot.imageIndex + 1}`}
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  priority={isCover}
                  onLoad={() => markImageLoaded(slot.imageIndex)}
                />
                {showMoreOverlay && isLoaded && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                    <span className='flex items-center gap-2 text-sm font-semibold text-white'>
                      <BsGrid3X3Gap className='h-4 w-4' />
                      +{extraPhotoCount} more
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <Button
          type='button'
          variant='outline'
          onClick={() => setShowGallery(true)}
          className='absolute bottom-4 right-4 gap-2 font-semibold shadow-md backdrop-blur-sm bg-background/95'
        >
          <BsGrid3X3Gap className='h-4 w-4' />
          Show all photos
        </Button>
      </section>

      {/* Mobile — cover only */}
      <section className='relative mt-8 md:hidden'>
        <button
          type='button'
          onClick={() => setShowGallery(true)}
          className='relative block h-[300px] w-full overflow-hidden rounded-xl'
        >
          {!loadedImages.has(0) && (
            <Skeleton className='absolute inset-0 z-10' />
          )}
          <Image
            src={images[0]}
            fill
            sizes='100vw'
            alt={name}
            className={`object-cover transition-opacity duration-300 ${
              loadedImages.has(0) ? "opacity-100" : "opacity-0"
            }`}
            priority
            onLoad={() => markImageLoaded(0)}
          />
          <div
            className={cn(
              showAllPhotosButtonClass,
              "absolute bottom-4 right-4 pointer-events-none"
            )}
          >
            <BsGrid3X3Gap className='h-4 w-4' />
            Show all photos
          </div>
        </button>
      </section>

      {showGallery && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-black'>
          <div className='sticky top-0 z-10 flex items-center justify-between bg-black/80 px-6 py-4 backdrop-blur-sm'>
            <p className='text-sm font-medium text-white'>
              {name} &middot; {images.length} photos
            </p>
            <button
              type='button'
              onClick={() => setShowGallery(false)}
              className='rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10'
            >
              Close
            </button>
          </div>
          <div className='mx-auto grid max-w-5xl gap-2 p-4 sm:grid-cols-2'>
            {images.map((image, index) => (
              <GalleryImage
                key={`${image}-gallery-${index}`}
                image={image}
                name={name}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryImage({
  image,
  name,
  index,
}: {
  image: string;
  name: string;
  index: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        index === 0 ? "aspect-[16/9] sm:col-span-2" : "aspect-[4/3]"
      }`}
    >
      {!isLoaded && <Skeleton className='absolute inset-0' />}
      <Image
        src={image}
        fill
        sizes='(max-width: 640px) 100vw, 50vw'
        alt={`${name} - image ${index + 1}`}
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export default ImageContainer;
