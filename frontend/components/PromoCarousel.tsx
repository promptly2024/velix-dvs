'use client';

import { useState, useEffect } from 'react';

interface SlideData {
  image: string;
}

const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const features = [
    {
      position: 'top-left' as const,
      text: 'PAN, Aadhaar, phone & email scans on dark web',
    },
    {
      position: 'middle-left' as const,
      text: 'Kids - Safe browsing mode',
    },
    {
      position: 'top-right' as const,
      text: 'Auto-generated complaints, will provide ready to use templates',
    },
    {
      position: 'bottom-right' as const,
      text: 'Credit card scans',
    },
  ];

  const slides: SlideData[] = [
    {
      image: '/pic1.png',
    },
    {
      image: '/pic2.png',
    },
    {
      image: '/pic3.png',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'left-12 sm:left-16 md:left-20 lg:left-24 top-12 sm:top-14 md:top-16 lg:top-16 -translate-x-full -translate-y-1/2';
      case 'middle-left':
        return 'left-8 sm:left-10 md:left-12 lg:left-14 top-32 sm:top-36 md:top-40 lg:top-40 -translate-x-full -translate-y-1/2';
      case 'top-right':
        return 'right-8 sm:right-12 md:right-16 lg:right-18 bottom-32 sm:bottom-36 md:bottom-40 lg:bottom-40 translate-x-full translate-y-1/2';
      case 'bottom-right':
        return 'right-6 sm:right-8 md:right-10 lg:right-10 bottom-8 sm:bottom-10 md:bottom-12 lg:bottom-12 translate-x-full translate-y-1/2';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#202020] flex items-center justify-center overflow-visible ">
      <div className="w-full max-w-5xl lg:max-w-6xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white text-center mb-6 md:mb-8 lg:mb-12 leading-tight max-w-3xl lg:max-w-4xl mx-auto px-4">
          Unifies the diverse features under a single, proactive promise.
        </h1>

        <div className="relative w-full mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`absolute z-20 hidden lg:block ${getPositionClasses(feature.position)}`}
            >
              <div className="bg-white/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-medium text-zinc-900 shadow-lg leading-relaxed max-w-32 sm:max-w-40 md:max-w-52 lg:max-w-60">
                {feature.text}
              </div>
            </div>
          ))}
          <div
            className={`relative w-full rounded-2xl overflow-hidden transition-opacity duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="w-full aspect-video lg:aspect-auto lg:h-96 relative bg-gray-700">
              <img
                src={slides[currentIndex].image}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;
