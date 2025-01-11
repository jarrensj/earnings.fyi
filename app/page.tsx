import Earnings from "@/components/Earnings";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">earnings.fyi</h1>
        <p className="text-center text-xs text-gray-500">
          {`${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}, ${new Date().toLocaleTimeString('en-US', { timeStyle: 'long' })}`}
        </p>
        <Earnings />
      </main>
      <Footer />
    </div>
  );
}
