'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQAccordion = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'How do auto - drafted templates work ?',
      answer: 'Our AI-powered system analyzes your case details and automatically generates professional complaint templates tailored to your situation, saving you time and ensuring all necessary information is included.',
    },
    {
      id: 2,
      question: 'Is my data safe with Veilix ?',
      answer: 'Yes, we use bank-level encryption and follow strict data protection standards. Your personal information is never shared with third parties, and we comply with all privacy regulations.',
    },
    {
      id: 3,
      question: 'What\'s included in the Premium plan ?',
      answer: 'The Premium plan includes unlimited breach monitoring, auto-drafted complaint templates, priority support, guardian mode access, and real-time alerts for all threats.',
    },
    {
      id: 4,
      question: 'What does Guardian Mode do ?',
      answer: 'Guardian Mode allows parents or guardians to monitor and protect family members by setting up safe browsing restrictions, monitoring online activity, and receiving alerts for suspicious behavior.',
    },
    {
      id: 5,
      question: 'What\'s included in kid-safe mode ?',
      answer: 'Kid-safe mode provides parental controls, blocks inappropriate content, limits screen time, and ensures a safer browsing experience for children with age-appropriate protections.',
    },
    {
      id: 6,
      question: 'What\'s included in mentor mode ?',
      answer: 'Mentor mode provides guided learning resources, tutorials, security tips, and personalized recommendations to help users understand cybersecurity best practices.',
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full bg-[#202020] py-8 md:py-12 lg:py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-2 md:mb-4">
            <span className="">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400">Let&apos;s clear things up!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
          <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6 lg:gap-8">
            {faqItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-[#303030] rounded-xl md:rounded-2xl border border-[#404040] overflow-hidden hover:border-[#505050] transition-all duration-300"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center justify-between px-5 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left hover:bg-[#2A2A2A] transition-colors duration-300"
                >
                  <span className="text-base md:text-lg font-semibold text-white pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`shrink-0 w-5 h-5 md:w-6 md:h-6 text-[#B2B8FF] transition-transform duration-300 ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedId === item.id ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 md:px-6 lg:px-8 pb-4 md:pb-5 lg:pb-6 text-sm md:text-base text-gray-300 border-t border-[#404040]">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6 lg:gap-8">
            {faqItems.slice(3, 6).map((item) => (
              <div
                key={item.id}
                className="bg-[#303030] rounded-xl md:rounded-2xl border border-[#404040] overflow-hidden hover:border-[#505050] transition-all duration-300"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center justify-between px-5 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-left hover:bg-[#2A2A2A] transition-colors duration-300"
                >
                  <span className="text-base md:text-lg font-semibold text-white pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`shrink-0 w-5 h-5 md:w-6 md:h-6 text-[#B2B8FF] transition-transform duration-300 ${
                      expandedId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedId === item.id ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 md:px-6 lg:px-8 pb-4 md:pb-5 lg:pb-6 text-sm md:text-base text-gray-300 border-t border-[#404040]">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
