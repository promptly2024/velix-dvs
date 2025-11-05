'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const navigationLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Privacy policy', href: '#privacy' },
    { label: 'Contact us', href: '#contact' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#instagram', label: 'Instagram' },
    { icon: Linkedin, href: '#linkedin', label: 'LinkedIn' },
  ];

  return (
    <footer className="w-full bg-black py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-6 md:gap-8">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src="/logo.png"
              alt="Veilix Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="text-center max-w-md md:max-w-2xl">
            <p
              className="text-lg md:text-2xl lg:text-3xl text-white font-medium leading-relaxed"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
              }}
            >
              From first scan to full protection
              <br />
              – we're with you every step
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 pt-12 md:pt-16">
          <p className="text-xs md:text-sm text-gray-400 whitespace-nowrap">
            © 2025 DVS Technologies Pvt. Ltd.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4 md:gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
