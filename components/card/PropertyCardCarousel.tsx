"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type PropertyCardCarouselProps = {
  images: string[];
  name: string;
  propertyId: string;
};

function PropertyCardCarousel({
  images,
  name,
  propertyId,
}: PropertyCardCarouselProps) {
  const hasMultipleImages = images.length > 1;

  return (
    <Carousel
      className='w-full'
      opts={{
        loop: hasMultipleImages,
      }}
    >
      <CarouselContent className='ml-0'>
        {images.map((image, index) => (
          <CarouselItem key={`${image}-${index}`} className='pl-0'>
            <Link
              href={`/properties/${propertyId}`}
              className='relative block h-[300px] overflow-hidden rounded-md'
            >
              <Image
                src={image}
                fill
                sizes='(max-width:768px) 100vw, 50vw'
                alt={`${name} - image ${index + 1}`}
                className='rounded-md object-cover transform group-hover:scale-110 transition-transform duration-500'
              />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasMultipleImages && (
        <>
          <CarouselPrevious
            type='button'
            className='left-3 z-10'
            onPointerDown={(event) => event.stopPropagation()}
          />
          <CarouselNext
            type='button'
            className='right-3 z-10'
            onPointerDown={(event) => event.stopPropagation()}
          />
        </>
      )}
    </Carousel>
  );
}

export default PropertyCardCarousel;
