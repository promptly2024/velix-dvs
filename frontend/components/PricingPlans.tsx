'use client';
import { CircleCheckBig, CircleX } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  buttonText: string;
  isPopular?: boolean;
  features: {
    name: string;
    included: boolean;
  }[];
}

const PricingPlans = () => {
  const plans: PricingPlan[] = [
    {
      name: 'Free',
      price: '₹0/',
      period: 'week',
      buttonText: 'Get started for free',
      isPopular: false,
      features: [
        {
          name: 'PAN, Aadhaar, phone & email scan (manual trigger only)',
          included: true,
        },
        {
          name: 'Credit card breach alerts',
          included: true,
        },
        {
          name: 'Valid for 7 days only',
          included: true,
        },
        {
          name: 'Single user acces',
          included: true,
        },
        {
          name: 'Kids - safe browser mode',
          included: false,
        },
        {
          name: 'Auto-drafted complaint templates',
          included: false,
        },
      ],
    },
    {
      name: 'Basic',
      price: '₹99/',
      period: 'month',
      buttonText: 'Buy now',
      isPopular: true,
      features: [
        {
          name: 'PAN, Aadhaar, phone & email scan (manual trigger only)',
          included: true,
        },
        {
          name: 'Credit card breach alerts',
          included: true,
        },
        {
          name: 'Kids - safe browser mode',
          included: true,
        },
        {
          name: 'Single user acces',
          included: true,
        },
        {
          name: 'Guardian mode access',
          included: false,
        },
        {
          name: 'Auto-drafted complaint templates',
          included: false,
        },
      ],
    },
    {
      name: 'Premium',
      price: '₹299/',
      period: 'month',
      buttonText: 'Buy now',
      isPopular: false,
      features: [
        {
          name: 'PAN, Aadhaar, phone & email scan (manual trigger only)',
          included: true,
        },
        {
          name: 'Credit card breach alerts',
          included: true,
        },
        {
          name: 'Kids - safe browser mode',
          included: true,
        },
        {
          name: 'Single user acces',
          included: true,
        },
        {
          name: 'Auto-drafted complaint templates',
          included: true,
        },
        {
          name: 'Guardian mode access',
          included: true,
        },
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#202020] py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 2xl:py-24 px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-16 xl:mb-20 2xl:mb-24">
          <h1 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-medium text-white mb-1 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-5">
            Choose your plan
          </h1>
          <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-400">
            Try free plan for 7 days
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl 2xl:rounded-3xl border-2 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 xl:p-9 2xl:p-10 transition-all duration-300 hover:shadow-2xl ${
                plan.isPopular
                  ? 'border-[#FDFEFE] bg-[#303030] shadow-lg'
                  : 'border-[#FDFEFE] bg-[#303030] hover:shadow-lg'
              }`}
            >
              <h2 
                className="text-white mb-2 xs:mb-3 sm:mb-4 md:mb-5"
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: '100%',
                  letterSpacing: '0px',
                }}
              >
                {plan.name}
              </h2>

              <div className="mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <div className="flex items-baseline gap-1 xs:gap-1.5 sm:gap-2">
                  <span 
                    className="text-white font-bold"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      lineHeight: '100%',
                      letterSpacing: '0px',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span 
                    className="text-gray-400 font-normal"
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      fontFamily: 'Poppins, sans-serif',
                      lineHeight: '100%',
                      letterSpacing: '0px',
                    }}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              <button 
                className="w-full bg-[#B2B8FF] hover:bg-[#A0A8FF] active:bg-[#9BA2FF] text-gray-900 py-1.5 xs:py-2 sm:py-2.5 md:py-3 lg:py-3.5 xl:py-4 2xl:py-4 rounded-md xs:rounded-md sm:rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl 2xl:rounded-xl transition-colors duration-300 mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 2xl:mb-14 cursor-pointer"
                style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  fontFamily: 'Poppins, sans-serif',
                  lineHeight: '36px',
                  letterSpacing: '0px',
                  verticalAlign: 'middle',
                }}
              >
                {plan.buttonText}
              </button>

              <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6 2xl:space-y-7">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2 xs:gap-2 sm:gap-2.5 md:gap-3 lg:gap-3 xl:gap-4 2xl:gap-4">
                    {feature.included ? (
                      <div className="shrink-0 mt-0.5">
                        <CircleCheckBig className="w-3 h-3 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 text-[#B2D9B2]" strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="shrink-0 mt-0.5">
                        <CircleX className="w-3 h-3 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 text-[#FF9999]" strokeWidth={2} />
                      </div>
                    )}
                    <span 
                      className="leading-relaxed font-normal"
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '21px',
                        color: feature.included ? '#D1D5DB' : '#9CA3AF',
                        fontFamily: 'Poppins, sans-serif',
                      }}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
