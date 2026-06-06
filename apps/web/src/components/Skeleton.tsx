import React from 'react'

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-elevated rounded-lg ${className}`} />
)

export const ProductCardSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[3/4] rounded-2xl" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
)

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)

export const ProductDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="flex flex-col lg:flex-row gap-12">
      <Skeleton className="w-full lg:w-1/2 aspect-square rounded-2xl" />
      <div className="w-full lg:w-1/2 space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  </div>
)
