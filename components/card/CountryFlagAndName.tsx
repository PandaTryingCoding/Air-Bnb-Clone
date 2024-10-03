import { findCountryByCode } from "@/utils/countries";
import React from "react";
import Flag from "react-world-flags";

function CountryFlagAndName({ countryCode }: { countryCode: string }) {
  const validCountry = findCountryByCode(countryCode)!;
  const countryName =
    validCountry.name.length > 20
      ? `${validCountry.name.substring(0, 20)}....`
      : validCountry.name;
  return (
    <span className='flex items-center gap-2 text-sm'>
      <Flag code={validCountry.code} style={{ width: 15, height: 15 }} />
      {countryName}
    </span>
  );
}

export default CountryFlagAndName;
