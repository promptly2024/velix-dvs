'use client';

import { Download } from 'lucide-react';

const DownloadCTA = () => {
  return (
    <div
      className="w-full h-screen bg-cover bg-center bg-no-repeat flex items-start justify-end px-4 md:px-8 lg:px-16 pt-12 md:pt-20 lg:pt-24"
      style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover'
      }}
    >
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-start items-start md:items-end">
        <div className="md:right-36">
          <h2
            className="text-2xl xs:text-2xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl font-medium text-white mb-6 md:mb-8 leading-tight max-w-md"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
            }}
          >
            Download the Veilix app now & stay one step ahead of threats!
          </h2>

          <button
            className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-black px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border-4 md:border-6 border-white cursor-pointer"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            <Download className="w-5 h-5 md:w-6 md:h-6" />
            <span>Download the app now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadCTA;
