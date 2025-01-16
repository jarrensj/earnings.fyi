'use client'

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-start justify-items-center min-h-screen p-4 pb-16 gap-8 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">glasscannon.co</h1>
        <Footer />
      </main>
    </div>
  );
}