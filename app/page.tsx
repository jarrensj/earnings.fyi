'use client'

import Footer from "@/components/Footer";
import { Orbitron } from 'next/font/google'
import Link from 'next/link'

const orbitron = Orbitron({ subsets: ['latin'] })


  export default function Home() {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-from)] via-[var(--bg-via)] to-[var(--bg-to)] z-[0]"></div>
        
        <div className="chart-background z-[1]">
          <div className="grid-lines"></div>
          <div className="chart-curve"></div>
        </div>
        
        <div className="geometric-bg">
          <div className="geometric-shape shape-1"></div>
          <div className="geometric-shape shape-2"></div>
        </div>
        
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        
        <h1 className={`${orbitron.className} text-4xl sm:text-6xl md:text-7xl font-bold mb-8 text-center relative tracing-outline z-10`}>
          <span className="tracing-text" data-text="glasscannon.co">glasscannon.co</span>
        </h1>
        
        <section className="max-w-2xl text-center mb-12 relative z-10">
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
          </p>
        </section>
        
        <nav className="flex flex-col sm:flex-row gap-4 relative z-10 mb-32">
          <Link href="/store" className="neon-button">
            Enter Store
          </Link>
          <Link href="/earnings" className="neon-button">
            Earnings Calendar
          </Link>
        </nav>
        <Footer />
      </main>
    )
  }
  