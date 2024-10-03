import { formatQuantity } from "@/utils/format";

type PropertyDetailsProps = {
  details: {
    bedrooms: number;
    baths: number;
    guests: number;
    beds: number;
  };
};

import React from "react";

const PropertyDetails = ({
  details: { bedrooms, baths, guests, beds },
}: PropertyDetailsProps) => {
  return (
    <p className='text-md font-medium'>
      <span>{formatQuantity(bedrooms, "bedroom")} &middot;</span>
      <span> {formatQuantity(baths, "bath")} &middot;</span>
      <span> {formatQuantity(beds, "bed")} &middot;</span>
      <span> {formatQuantity(guests, "guest")} </span>
    </p>
  );
};

export default PropertyDetails;
