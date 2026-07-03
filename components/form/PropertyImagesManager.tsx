"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { LuX } from "react-icons/lu";
import SubmitButton from "./Buttons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { MAX_PROPERTY_IMAGES } from "@/utils/schemas";
import { type actionFunction } from "@/utils/types";

type PropertyImageItem = {
  id: string;
  url: string;
  order: number;
};

type PropertyImagesManagerProps = {
  propertyId: string;
  name: string;
  images: PropertyImageItem[];
  deleteAction: actionFunction;
  addAction: actionFunction;
};

const initialState = {
  message: "",
};

function DeleteImageForm({
  propertyId,
  imageId,
  deleteAction,
}: {
  propertyId: string;
  imageId: string;
  deleteAction: actionFunction;
}) {
  const [state, formAction] = useFormState(deleteAction, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.message) return;

    toast({ description: state.message });
    if (state.message.toLowerCase().includes("successfully")) {
      router.refresh();
    }
  }, [state.message, toast, router]);

  return (
    <form action={formAction}>
      <input type='hidden' name='propertyId' value={propertyId} />
      <input type='hidden' name='imageId' value={imageId} />
      <Button
        type='submit'
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 h-6 w-6'
      >
        <LuX className='h-3 w-3' />
      </Button>
    </form>
  );
}

function AddImagesForm({
  propertyId,
  addAction,
  inputRef,
  onClear,
}: {
  propertyId: string;
  addAction: actionFunction;
  inputRef: React.RefObject<HTMLInputElement>;
  onClear: () => void;
}) {
  const [state, formAction] = useFormState(addAction, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.message) return;

    toast({ description: state.message });
    if (state.message.toLowerCase().includes("successfully")) {
      onClear();
      router.refresh();
    }
  }, [state.message, toast, onClear, router]);

  return (
    <form action={formAction}>
      <input type='hidden' name='propertyId' value={propertyId} />
      <input
        ref={inputRef}
        type='file'
        name='images'
        multiple
        className='hidden'
        tabIndex={-1}
        aria-hidden
      />
      <SubmitButton text='Upload Images' size='sm' />
    </form>
  );
}

function PropertyImagesManager({
  propertyId,
  name,
  images,
  deleteAction,
  addAction,
}: PropertyImagesManagerProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_PROPERTY_IMAGES - images.length;
  const canAddMore = remainingSlots > 0;

  const syncInputFiles = (files: File[]) => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    const toAdd = selected.slice(0, remainingSlots - newImages.length);
    const nextImages = [...newImages, ...toAdd];
    const nextPreviews = [
      ...previews,
      ...toAdd.map((file) => URL.createObjectURL(file)),
    ];

    setNewImages(nextImages);
    setPreviews(nextPreviews);
    syncInputFiles(nextImages);

    if (pickerRef.current) {
      pickerRef.current.value = "";
    }
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const nextImages = newImages.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    setNewImages(nextImages);
    setPreviews(nextPreviews);
    syncInputFiles(nextImages);
  };

  const clearNewImages = () => {
    previews.forEach((src) => URL.revokeObjectURL(src));
    setNewImages([]);
    setPreviews([]);
    syncInputFiles([]);
    if (pickerRef.current) {
      pickerRef.current.value = "";
    }
  };

  return (
    <div className='mb-8'>
      <Label className='capitalize text-base'>
        Images ({images.length}/{MAX_PROPERTY_IMAGES})
      </Label>
      <p className='text-sm text-muted-foreground mb-4'>
        The first image is used as the cover. At least one image is required.
      </p>

      <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-2xl mb-6'>
        {images.map((image) => (
          <div
            key={image.id}
            className='relative aspect-square rounded overflow-hidden border'
          >
            <Image
              src={image.url}
              alt={`${name} photo ${image.order + 1}`}
              fill
              className='object-cover'
              sizes='120px'
            />
            {image.order === 0 && (
              <span className='absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded'>
                Cover
              </span>
            )}
            {images.length > 1 && (
              <DeleteImageForm
                propertyId={propertyId}
                imageId={image.id}
                deleteAction={deleteAction}
              />
            )}
          </div>
        ))}
      </div>

      {canAddMore && (
        <div className='border-t pt-6'>
          <Label className='capitalize'>Add Images</Label>
          <p className='text-sm text-muted-foreground mb-3'>
            You can add up to {remainingSlots} more image
            {remainingSlots === 1 ? "" : "s"}.
          </p>

          {previews.length > 0 && (
            <div className='grid grid-cols-3 gap-2 mb-3 max-w-md'>
              {previews.map((src, index) => (
                <div
                  key={src}
                  className='relative aspect-square rounded overflow-hidden border'
                >
                  <img
                    src={src}
                    alt={`New preview ${index + 1}`}
                    className='h-full w-full object-cover'
                  />
                  <Button
                    type='button'
                    variant='destructive'
                    size='icon'
                    className='absolute top-1 right-1 h-6 w-6'
                    onClick={() => removeNewImage(index)}
                  >
                    <LuX className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {newImages.length < remainingSlots && (
            <Input
              ref={pickerRef}
              type='file'
              accept='image/*'
              multiple
              onChange={handleFileChange}
              className='max-w-xs mb-4'
            />
          )}

          {newImages.length > 0 && (
            <AddImagesForm
              propertyId={propertyId}
              addAction={addAction}
              inputRef={inputRef}
              onClear={clearNewImages}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyImagesManager;
