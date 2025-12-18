'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import BackIcon from '@/icons/back-icon';
import CircleButton from '../custom/circle-button';

export default function ImageSlideshow({ images, mainImageIndex = 0, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Stelle sicher, dass mainImageIndex gültig ist
    if (images && images.length > 0 && mainImageIndex >= 0 && mainImageIndex < images.length) {
      return mainImageIndex;
    }
    return 0;
  });
  const [api, setApi] = useState();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect(); // Set initial index

    return () => api.off('select', onSelect);
  }, [api]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!api || images.length <= 1 || isHovered) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api, images.length, isHovered]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src="/default_avatar.jpg"
          alt="Event Bild"
          fill
          className="object-cover rounded-2xl"
        />
      </div>
    );
  }

  // Wenn nur ein Bild vorhanden ist, zeige es ohne Carousel
  if (images.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={images[0]}
          alt="Event Bild"
          fill
          className="object-cover rounded-2xl"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Thumbnail Dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 absolute bottom-4 left-0 right-0 z-10">
          {images.map((_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full cursor-pointer transition-all
                ${index === currentIndex
                  ? 'bg-white'
                  : 'bg-white/40'
                }
              `}
              onClick={() => {
                setCurrentIndex(index);
                api?.scrollTo(index);
              }}
            />
          ))}
        </div>
      )}

      <Carousel
        opts={{
          align: "start",
          loop: true,
          startIndex: images && images.length > 0 && mainImageIndex >= 0 && mainImageIndex < images.length ? mainImageIndex : 0,
        }}
        className="w-full rounded-2xl overflow-hidden"
        setApi={setApi}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className={`relative w-full rounded-2xl overflow-hidden ${className}`}>
                <Image
                  src={image}
                  alt={`Event Bild ${index + 1}`}
                  fill
                  className="object-cover rounded-2xl overflow-hidden"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CircleButton
          type="button"
          size="icon"
          className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 safari-icon-fix safari-center-fix transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'
            }`}
          onClick={() => {
            const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
            setCurrentIndex(prevIndex);
            api?.scrollTo(prevIndex);
          }}
        >
          <BackIcon className="w-4 h-4 shrink-0" />
        </CircleButton>
        <CircleButton
          type="button"
          size="icon"
          className={`hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 safari-icon-fix safari-center-fix z-20 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0'
            }`}
          onClick={() => {
            const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
            setCurrentIndex(nextIndex);
            api?.scrollTo(nextIndex);
          }}
        >
          <BackIcon className="w-4 h-4 transform rotate-180 shrink-0" />
        </CircleButton>
      </Carousel>
    </div>
  );
} 