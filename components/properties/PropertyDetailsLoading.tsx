import { Skeleton } from "@/components/ui/skeleton";
import BentoImageSkeleton from "@/components/properties/BentoImageSkeleton";
import { pickLayout } from "@/components/properties/bentoLayouts";

function PropertyDetailsLoading() {
  const imageLayout = pickLayout(6);

  return (
    <section>
      <Skeleton className='h-4 w-48' />
      <div className='mt-4 flex items-center justify-between'>
        <Skeleton className='h-10 w-2/3 max-w-xl' />
        <div className='flex gap-4'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <Skeleton className='h-10 w-10 rounded-full' />
        </div>
      </div>

      <BentoImageSkeleton layout={imageLayout} />

      <Skeleton className='mt-8 h-[300px] w-full rounded-xl md:hidden' />

      <section className='mt-12 lg:grid lg:grid-cols-12 lg:gap-x-8'>
        <div className='lg:col-span-8'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-5 w-24' />
          </div>
          <Skeleton className='mt-2 h-5 w-64' />
          <div className='mt-4 flex items-center gap-3'>
            <Skeleton className='h-12 w-12 rounded-full' />
            <Skeleton className='h-5 w-32' />
          </div>
          <Skeleton className='mt-4 h-px w-full' />
          <Skeleton className='mt-4 h-24 w-full' />
          <Skeleton className='mt-6 h-32 w-full' />
          <Skeleton className='mt-6 h-[300px] w-full rounded-xl' />
        </div>
        <div className='mt-8 lg:col-span-4 lg:mt-0'>
          <Skeleton className='h-[360px] w-full rounded-xl' />
        </div>
      </section>
    </section>
  );
}

export default PropertyDetailsLoading;
