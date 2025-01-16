'use client'

import { useEffect, useState } from 'react';
import Earnings from "@/components/Earnings";
import Footer from "@/components/Footer";

export default function Home() {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateTime(`${now.toLocaleDateString('en-US', { dateStyle: 'full' })}, ${now.toLocaleTimeString('en-US', { timeStyle: 'long' })}`);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] z-[0]"></div>
      
      <div className="geometric-bg fixed inset-0">
        <div className="geometric-shape shape-1"></div>
        <div className="geometric-shape shape-2"></div>
      </div>
      
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
      
      {/* Content wrapper */}
      <div className="relative flex flex-col items-center justify-between min-h-screen w-full z-10">
        {/* Main content */}
        <div className="flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">earnings calendar</h1>
          <p className="text-center text-xs text-gray-400">
            {dateTime}
          </p>
          <div className="mb-12">
            <Earnings />
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
