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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">earnings.fyi</h1>
        <p className="text-center text-xs text-gray-500">
          {dateTime}
        </p>
        <Earnings />
      </main>
      <Footer />
    </div>
  );
}
