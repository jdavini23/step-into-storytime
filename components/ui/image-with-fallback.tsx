'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(`[ImageWithFallback] Loading image: ${src}`);
  }, [src]);

  const handleError = (e: any) => {
    console.error(`[ImageWithFallback] Error loading image: ${src}`, e);
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log(`[ImageWithFallback] Successfully loaded image: ${src}`);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
