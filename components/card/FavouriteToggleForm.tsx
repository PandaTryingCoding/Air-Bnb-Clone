"use client";
import React from "react";
import { usePathname } from "next/navigation";
import FormContainer from "../form/FormContainer";
import { toggleFavouriteAction } from "@/utils/actions";
import { CardSubmitButton } from "../form/Buttons";

type FavouriteToggleFormProps = {
  propertyId: string;
  favoriteId: string | null;
};

function FavouriteToggleForm({
  propertyId,
  favoriteId,
}: FavouriteToggleFormProps) {
  const pathname = usePathname();
  const toggleAction = toggleFavouriteAction.bind(null, {
    propertyId,
    favoriteId,
    pathname,
  });

  return (
    <FormContainer action={toggleAction}>
      <CardSubmitButton isFavourite={favoriteId ? true : false} />
    </FormContainer>
  );
}

export default FavouriteToggleForm;
