import { Skeleton } from "@/components/ui/skeleton";
import { BentoLayout } from "./bentoLayouts";

type BentoImageSkeletonProps = {
  layout: BentoLayout;
};

function BentoImageSkeleton({ layout }: BentoImageSkeletonProps) {
  if (layout.id === "single") {
    return (
      <Skeleton className='mt-8 h-[300px] w-full rounded-xl md:h-[500px]' />
    );
  }

  return (
    <section className='mt-8 hidden md:block'>
      <div
        className={`grid gap-2 overflow-hidden rounded-xl ${layout.gridClass}`}
      >
        {layout.slots.map((slot, slotIndex) => (
          <Skeleton
            key={`${layout.id}-skeleton-${slotIndex}`}
            className={`h-full min-h-0 w-full ${slot.className}`}
          />
        ))}
      </div>
    </section>
  );
}

export default BentoImageSkeleton;
