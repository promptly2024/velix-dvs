'use client';

import Image from 'next/image';

interface Mode {
  title: string;
  description: string;
  icon: string;
}

const PowerfulModes = () => {
  const modes: Mode[] = [
    {
      title: 'Guardian mode',
      description: 'Emergency response for immediate digital threat management',
      icon: 'guardian-icon'
    },
    {
      title: 'Mentor mode',
      description: 'Interactive learning to build stronger digital safety habits',
      icon: 'mentor-icon'
    }
  ];

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: '#202020' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-10 py-16 md:py-20 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="flex flex-col justify-start">
            <h2 className="text-3xl md:text-4xl lg:text-[2.3rem] font-bold text-white mb-4 md:mb-6 leading-tight">
              Two powerful modes to 
              secure your digital world
            </h2>
            
            <p className="text-sm md:text-base lg:text-base text-gray-300 mb-12 md:mb-16 leading-relaxed">
              Veilix provides comprehensive digital safety through innovative protection strategies.
            </p>
            <div className="flex flex-col md:flex-row gap-12 md:gap-16 lg:gap-20">
              {modes.map((mode, index) => (
                <div key={index} className="flex flex-col gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <Image
                      src={`/${mode.icon}.png`}
                      alt={mode.title}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-xl font-semibold text-white">
                    {mode.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-sm text-gray-400 leading-relaxed max-w-xs">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex items-start justify-center h-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            <div className="relative w-full aspect-square flex items-center justify-center">
              <Image
                src="/DVSscoreanimation.gif"
                alt="DVS Animation"
                width={500}
                height={500}
                unoptimized
                priority
                className="w-full max-w-lg h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PowerfulModes;
