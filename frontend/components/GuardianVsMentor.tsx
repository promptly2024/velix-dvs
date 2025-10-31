'use client';

import React from 'react';
import Image from 'next/image';

const GuardianVsMentor: React.FC = () => {
  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: '#202020' }}
    >
        <div className='border-t-2 border-[#FDFEFE] rounded-t-[7rem]'>
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-10 py-16 md:py-20 lg:py-32 w-full">
                <div className="text-center mb-16 md:mb-24 lg:mb-32">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    Velix adapts to your needs—whether you want to act fast or build lasting habits.
                </h2>
                
                <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed">
                    Guardian Mode protects you when things go wrong,<br />
                    Mentor Mode prepares you so they don't happen....
                </p>
                </div>

                <div className="flex justify-center relative">
                <Image
                    src="/Group652.png"
                    alt="Person holding how it helps card"
                    width={200}
                    height={200}
                    className="object-contain"
                />
                </div>
                <div className="w-full">
                <Image
                    src="/Frame96.png"
                    alt="Guardian vs Mentor comparison"
                    width={1200}
                    height={500}
                    className="w-full object-contain"
                />
                </div>
            </div>
        </div>
    </section>
  );
};

export default GuardianVsMentor;
