"use client";

import { useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MAX_PROPERTY_IMAGES } from "@/utils/schemas";
import { LuX } from "react-icons/lu";

function PropertyImagesInput() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

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

    const remaining = MAX_PROPERTY_IMAGES - images.length;
    const toAdd = selected.slice(0, remaining);

    const nextImages = [...images, ...toAdd];
    const nextPreviews = [
      ...previews,
      ...toAdd.map((file) => URL.createObjectURL(file)),
    ];

    setImages(nextImages);
    setPreviews(nextPreviews);
    syncInputFiles(nextImages);

    if (pickerRef.current) {
      pickerRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const nextImages = images.filter((_, i) => i !== index);
    const nextPreviews = previews.filter((_, i) => i !== index);
    setImages(nextImages);
    setPreviews(nextPreviews);
    syncInputFiles(nextImages);
  };

  return (
    <div className='mb-2'>
      <Label className='capitalize'>
        Images ({images.length}/{MAX_PROPERTY_IMAGES})
      </Label>
      <p className='text-sm text-muted-foreground mb-2'>
        Upload up to {MAX_PROPERTY_IMAGES} images. The first image is used as
        the cover.
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
                alt={`Preview ${index + 1}`}
                className='h-full w-full object-cover'
              />
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-1 right-1 h-6 w-6'
                onClick={() => removeImage(index)}
              >
                <LuX className='h-3 w-3' />
              </Button>
              {index === 0 && (
                <span className='absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded'>
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_PROPERTY_IMAGES && (
        <Input
          ref={pickerRef}
          type='file'
          accept='image/*'
          multiple
          onChange={handleFileChange}
          className='max-w-xs'
        />
      )}

      <input
        ref={inputRef}
        type='file'
        name='images'
        multiple
        required={images.length === 0}
        className='hidden'
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}

export default PropertyImagesInput;
