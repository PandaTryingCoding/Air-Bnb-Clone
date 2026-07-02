export type BentoSlot = {
  imageIndex: number;
  className: string;
};

export type BentoLayout = {
  id: string;
  gridClass: string;
  slots: BentoSlot[];
};

/** 1 image — full single cell */
export const SINGLE_IMAGE_LAYOUT: BentoLayout = {
  id: "single",
  gridClass: "",
  slots: [{ imageIndex: 0, className: "h-[300px] md:h-[500px]" }],
};

/** 2 images — 60% cover / 40% second */
export const TWO_IMAGE_LAYOUT: BentoLayout = {
  id: "two",
  gridClass: "grid grid-cols-[3fr_2fr] h-[28rem]",
  slots: [
    { imageIndex: 0, className: "" },
    { imageIndex: 1, className: "" },
  ],
};

/** 3 images — cover 60% left, two stacked right */
export const THREE_IMAGE_LAYOUT: BentoLayout = {
  id: "three",
  gridClass: "grid grid-cols-[3fr_2fr] grid-rows-2 h-[28rem]",
  slots: [
    { imageIndex: 0, className: "row-span-2" },
    { imageIndex: 1, className: "" },
    { imageIndex: 2, className: "" },
  ],
};

/** 4 images — cover 60% left, three on the right */
export const FOUR_IMAGE_LAYOUT: BentoLayout = {
  id: "four",
  gridClass: "grid grid-cols-[3fr_1fr_1fr] grid-rows-2 h-[28rem]",
  slots: [
    { imageIndex: 0, className: "row-span-2" },
    { imageIndex: 1, className: "" },
    { imageIndex: 2, className: "" },
    { imageIndex: 3, className: "col-span-2" },
  ],
};

/** 5 images — cover 60% left, 2×2 grid on the right */
export const FIVE_IMAGE_LAYOUT: BentoLayout = {
  id: "five",
  gridClass: "grid grid-cols-[3fr_1fr_1fr] grid-rows-2 h-[28rem]",
  slots: [
    { imageIndex: 0, className: "row-span-2" },
    { imageIndex: 1, className: "" },
    { imageIndex: 2, className: "" },
    { imageIndex: 3, className: "" },
    { imageIndex: 4, className: "" },
  ],
};

export function pickLayout(imageCount: number): BentoLayout {
  if (imageCount <= 1) return SINGLE_IMAGE_LAYOUT;
  if (imageCount === 2) return TWO_IMAGE_LAYOUT;
  if (imageCount === 3) return THREE_IMAGE_LAYOUT;
  if (imageCount === 4) return FOUR_IMAGE_LAYOUT;
  return FIVE_IMAGE_LAYOUT;
}

/** Visible slots in the grid (max 5); 6+ images use overlay on the last slot */
export function getVisibleImageCount(imageCount: number): number {
  return Math.min(imageCount, 5);
}
