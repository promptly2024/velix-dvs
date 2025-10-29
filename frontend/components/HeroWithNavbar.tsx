'use client'
import Image from 'next/image';

export default function HeroWithNavbar() {
  return (
    <section
      className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col"
      style={{
        backgroundImage: 'url("/bg-image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute left-0 bottom-0 w-full z-0 pointer-events-none">
        <Image
          src="/vector.svg"
          alt="Grid Vector"
          width={1440}
          height={295}
          className="w-full"
          priority
        />
      </div>

      <nav className="w-full flex items-center justify-between px-4 md:px-8 py-4 z-10 relative">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Veilix Logo"
            width={44}
            height={44}
            className="object-contain md:w-14 md:h-14"
          />
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="#" className="text-white text-sm md:text-base hover:text-gray-300 transition">Why veilix?</a>
          <div className="relative">
            <button className="text-white flex items-center gap-1">
              En
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative flex flex-col-reverse md:flex-row justify-between items-center md:items-start w-full h-full max-w-[1400px] mx-auto z-10 pt-8 md:pt-20 pb-10 px-4 md:px-8">
        <div className="flex-1 flex flex-col justify-center min-w-[180px] max-w-full md:max-w-[60%]">
          <div className="border border-[#404040] text-white rounded-[10px] px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm inline-block mb-3 md:mb-4">
            1 in 3 families face digital threats. Here’s how Veilix protects yours!{' '}
            <a href="#" className="text-indigo-400 font-semibold underline">Read more →</a>
          </div>
          <h1 className="text-[2rem] md:text-5xl lg:text-5xl font-normal mb-4 md:mb-5 leading-[1.1] text-white wrap-break-word">
            Built for Indian families,<br />
            trusted nationwide.
          </h1>
          <p className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 text-gray-300 max-w-full md:max-w-2xl">
            Protect your family's digital life with intelligent scanning and real-time guidance. We find vulnerabilities before hackers do
          </p>
          <div className="relative w-fit mb-8 md:mb-14 group">
            <span className="animated-gradient-border" aria-hidden="true"></span>
            <button
              className="
                border-inner flex items-center gap-2.5
                px-5 md:px-6 py-2 md:py-2.5 rounded-2xl font-semibold
                text-black text-sm md:text-base shadow transition
                relative z-10
              "
              style={{ minWidth: 180, height: 48, fontFamily: 'Poppins, sans-serif' }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12M12 16l-4-4m4 4l4-4M20 20H4" />
              </svg>
              <span className="font-normal text-base md:text-lg">Download the app now</span>
            </button>
          </div>
          <div className="flex items-end gap-4 text-white">
            <span className="text-5xl md:text-7xl font-normal">42</span>
            <div>
              <span className="block text-lg md:text-xl font-medium">Thousand families</span>
              <span className="block text-gray-400 text-sm md:text-base">Protected in the last 6 months</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center md:justify-end items-start relative h-min md:h-full mb-10 md:mb-0 md:pl-8">
          <div className="absolute -bottom-5 right-1/2 md:right-[54px] md:left-auto left-1/2 transform -translate-x-1/2 md:translate-x-0 w-[200px] h-[120px] md:w-[340px] md:h-[200px] rounded-full pointer-events-none z-0"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(255,215,131,0.16) 0%, rgba(12,12,12,0.00) 80%)'
            }}>
          </div>
          <div className="relative rounded-full overflow-hidden mx-auto md:mx-0 w-[200px] h-[200px] md:w-[340px] md:h-[340px]">
            <Image
              src="/family.png"
              alt="Indian family"
              width={340}
              height={340}
              className="object-cover rounded-full w-[200px] h-[200px] md:w-[340px] md:h-[340px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
