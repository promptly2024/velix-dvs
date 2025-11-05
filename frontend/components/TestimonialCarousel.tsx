'use client';

import Image from 'next/image';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  text: string;
}

const TestimonialCarousel = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Rohit kumar yadav',
      avatar: '/people.jpg',
      text: 'Credit card breach alert came in before my bank even notified! That one notification saved me hours of damage control.',
    },
    {
      id: 2,
      name: 'Janvi khanna',
      avatar: '/people.jpg',
      text: 'I signed up for the free trial just to check it out. Found my email in a dark web dump. That was a wake-up call!',
    },
    {
      id: 3,
      name: 'Shivraj malla',
      avatar: '/people.jpg',
      text: 'My Aadhaar and phone number were exposed in a scam. Veilix alerted me & helped me send a formal complaint to my bank. I didn&apos;t even know where to start before that.',
    },
    {
      id: 4,
      name: 'Shail Jaiswal',
      avatar: '/people.jpg',
      text: 'I travel a lot and use public Wi-Fi all the time. Veilix gives me instant alerts if anything&apos;s off. It&apos;s like having a digital bodyguard.',
    },
    {
      id: 5,
      name: 'Priya Singh',
      avatar: '/people.jpg',
      text: 'I really appreciated how easy the whole process is. Real-time protection without any hassle or complexity.',
    },
  ];

  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="w-full bg-[#202020] py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-full mx-auto">
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-4 xs:mb-6 sm:mb-8 md:mb-12 lg:mb-16">
          What people say
        </h2>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 z-20 h-full w-8 xs:w-12 sm:w-16 md:w-20 lg:w-32 bg-gradient-to-r from-[#202020] via-[#202020] to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 z-20 h-full w-8 xs:w-12 sm:w-16 md:w-20 lg:w-32 bg-gradient-to-l from-[#202020] via-[#202020] to-transparent pointer-events-none"></div>
          <div className="flex gap-2 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 animate-scroll">
            {allTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="shrink-0 w-60 xs:w-[260px] sm:w-[280px] md:w-[300px] lg:w-[313px] h-40 xs:h-[175px] sm:h-[190px] md:h-[205px] rounded-lg xs:rounded-xl sm:rounded-2xl border border-[#5F5F5F] bg-[#2A2A2A] p-4 xs:p-5 sm:p-6 md:p-6 flex flex-col justify-between hover:border-[#B2B8FF] transition-all duration-300"
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="relative shrink-0 w-10 xs:w-11 sm:w-12 h-10 xs:h-11 sm:h-12 rounded-lg overflow-hidden bg-gray-600">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xs xs:text-sm sm:text-sm md:text-base text-white font-semibold truncate leading-tight">
                    {testimonial.name}
                  </h3>
                </div>
                <p className="text-[11px] xs:text-xs sm:text-sm md:text-sm text-[#B0B0B0] font-normal leading-4 xs:leading-[18px] sm:leading-[21px] line-clamp-3">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 1rem));
          }
        }

        .animate-scroll {
          animation: scroll 45s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .animate-scroll {
            animation: scroll 40s linear infinite;
          }
        }

        @media (min-width: 1280px) {
          .animate-scroll {
            animation: scroll 50s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default TestimonialCarousel;
