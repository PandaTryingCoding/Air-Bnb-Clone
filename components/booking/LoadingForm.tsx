import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Card, CardHeader } from "../ui/card";

function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className='mb-2'>
      <Skeleton className='h-4 w-28 mb-2' />
      <Skeleton className={tall ? "h-28 w-full" : "h-10 w-full"} />
    </div>
  );
}

function CounterSkeleton() {
  return (
    <Card className='mb-4'>
      <CardHeader className='flex flex-col gap-y-5'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-4 w-44' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-8 rounded-md' />
            <Skeleton className='h-6 w-5' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function ImagesSkeleton() {
  return (
    <div className='mb-2'>
      <Skeleton className='h-4 w-24 mb-2' />
      <Skeleton className='h-4 w-full max-w-xs mb-3' />
      <div className='grid grid-cols-3 gap-2 mb-3 max-w-md'>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className='aspect-square w-full rounded' />
        ))}
      </div>
      <Skeleton className='h-10 w-full max-w-xs' />
    </div>
  );
}

function LoadingForm() {
  return (
    <section>
      <Skeleton className='h-8 w-48 mb-8' />

      <div className='border p-8 rounded'>
        <Skeleton className='h-6 w-32 mb-4' />

        <div className='grid md:grid-cols-2 gap-8 mb-4'>
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        <FieldSkeleton tall />

        <div className='grid sm:grid-cols-2 gap-8 mt-4'>
          <FieldSkeleton />
          <ImagesSkeleton />
        </div>

        <Skeleton className='h-6 w-44 mt-8 mb-4' />

        <CounterSkeleton />
        <CounterSkeleton />
        <CounterSkeleton />
        <CounterSkeleton />

        <Skeleton className='h-6 w-24 mt-10 mb-6' />

        <div className='grid grid-cols-2 gap-4'>
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Skeleton className='h-4 w-4 rounded-sm shrink-0' />
              <Skeleton className='h-4 w-28' />
            </div>
          ))}
        </div>

        <Skeleton className='h-11 w-36 mt-12 rounded-md' />
      </div>
    </section>
  );
}

export default LoadingForm;
