'use client';

import React from 'react';
import Image from 'next/image';

interface DefenseStep {
  number: number;
  title: string;
  fullTitle: string;
  description: string;
  gifName: string;
}

const DigitalDefense: React.FC = () => {
  const steps: DefenseStep[] = [
    {
      number: 1,
      title: 'Scan',
      fullTitle: 'Step 1 Scan',
      description: 'Initiate a deep scan across platforms to detect personal data leaks and scam exposure.',
      gifName: 'scananimation'
    },
    {
      number: 2,
      title: 'Exposure score',
      fullTitle: 'Step 2 Exposure score',
      description: 'Receive your Digital Vulnerability Score (DVS) to understand your current risk level.',
      gifName: 'circleanimation'
    },
    {
      number: 3,
      title: 'Activate guardian mode',
      fullTitle: 'Step 3 Activate guardian mode',
      description: 'Get personalized steps to resolve scams and secure your identity.',
      gifName: 'guardian'
    },
    {
      number: 4,
      title: 'Monitor & manage',
      fullTitle: 'Step 4 Monitor & manage',
      description: 'Initiate a deep scan across platforms to detect personal data leaks and scam exposure.',
      gifName: 'family'
    },
    {
      number: 5,
      title: 'Upgrade for full protection',
      fullTitle: 'Step 5 Upgrade for full protection',
      description: 'Initiate a deep scan across platforms to detect personal data leaks and scam exposure.',
      gifName: 'upgrade'
    }
  ];

  const getArrowImage = (index: number): string => {
    const arrowMap: { [key: number]: string } = {
      0: 'arrow1.gif',
      1: 'arrow2.gif',
      2: 'arrow3.gif',
      3: 'arrow4.gif'
    };
    return arrowMap[index] || 'arrow1.gif';
  };

  return (
    <section 
      className="relative w-full overflow-visible flex flex-col"
      style={{ backgroundColor: '#303030' }}
    >
      <div className="absolute left-0 top-0 w-full z-0 pointer-events-none">
        <Image
          src="/AfterHeroVector.svg"
          alt="Grid Vector"
          width={1440}
          height={200}
          className="w-full"
          priority
        />
      </div>
      <div className='border-b-2 border-[#FDFEFE] rounded-[7rem]'>
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-20 sm:pt-28 md:pt-32 lg:pt-40 pb-12 sm:pb-16 md:pb-20 lg:pb-32">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-md text-white mb-4 sm:mb-5 md:mb-6 tracking-tight">
              Digital Defense, Delivered in 5 Steps
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed">
              A guided journey through detection,<br />
              resolution, and ongoing digital safety.
            </p>
          </div>
          <div className="hidden lg:block relative w-full py-8 md:py-12 lg:py-16">
            <div className="relative flex justify-between items-stretch w-full">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div 
                    className="flex-1 flex flex-col items-center"
                    style={{
                      marginTop: step.number % 2 === 1 ? '0px' : '100px',
                      marginBottom: step.number % 2 === 0 ? '0px' : '100px'
                    }}
                  >
                    <div
                      className="group relative backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col justify-between items-center"
                      style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '16px',
                        backgroundColor: '#E2E4FF',
                        border: '1px solid rgba(200, 200, 240, 0.2)',
                        padding: '14px'
                      }}
                    >
                      <div 
                        className="flex items-center justify-center rounded-lg transition-colors duration-300 grow"
                        style={{
                          backgroundColor: 'transparent',
                          width: '110px',
                          height: '110px'
                        }}
                      >
                        <Image
                          src={`/${step.gifName}.gif`}
                          alt={step.title}
                          width={110}
                          height={110}
                          unoptimized
                          className="object-contain"
                        />
                      </div>

                      <p className="text-xs text-gray-900 text-center leading-tight mt-1">
                        {step.description}
                      </p>
                    </div>

                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white text-center mt-3 wrap-break-word">
                      {step.fullTitle}
                    </h3>
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className="flex items-center justify-center"
                      style={{
                        marginTop: step.number % 2 === 1 ? '50px' : '0px',
                        marginLeft: '-20px',
                        marginRight: '-20px',
                        zIndex: 5
                      }}
                    >
                      <Image
                        src={`/${getArrowImage(index)}`}
                        alt={`arrow between step ${step.number} and ${step.number + 1}`}
                        width={120}
                        height={120}
                        unoptimized
                        className="object-contain bg-transparent "
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {steps.map((step) => (
              <div 
                key={step.number} 
                className="flex flex-col items-center"
              >
                <div
                  className="group relative backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col justify-between items-center"
                  style={{
                    width: '140px',
                    height: '160px',
                    borderRadius: '16px',
                    backgroundColor: '#E2E4FF',
                    border: '1px solid rgba(200, 200, 240, 0.2)',
                    padding: '12px'
                  }}
                >
                  <div 
                    className="flex items-center justify-center rounded-lg transition-colors duration-300 grow"
                    style={{
                      backgroundColor: 'transparent',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    <Image
                      src={`/${step.gifName}.gif`}
                      alt={step.title}
                      width={80}
                      height={80}
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <p className="text-[10px] sm:text-xs text-gray-900 text-center leading-tight mt-1">
                    {step.description}
                  </p>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-white text-center mt-3 wrap-break-word">
                  {step.fullTitle}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalDefense;
