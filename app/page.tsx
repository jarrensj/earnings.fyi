import Earnings from "@/components/Earnings";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <main className="flex flex-col items-center p-24 flex-grow">
        <h1 className="text-2xl font-bold mb-4">earnings.fyi</h1>
        <p className="text-lg text-center mb-4">
          This is not financial advice. Read the disclaimer.
        </p>
        <Earnings />
      </main>
      <Footer />
    </div>
  );
}