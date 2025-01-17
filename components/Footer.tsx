import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="row-start-3 flex flex-col gap-6 items-center justify-center text-gray-400 relative z-10">
      <p className="max-w-4xl text-center text-sm">
        Disclaimer: The information provided on this website is for informational purposes only. This is not financial advice. We may own positions in whatever that&apos;s mentioned. You are responsible for your own decisions and your own losses. Information may not be accurate. This is not a complete calendar. All company logos and trademarks displayed on this website are the property of their respective owners and do not imply any affiliation with glasscannon.co.
      </p>
      <p className="text-sm opacity-50">
        code by&nbsp;<Link href="https://discord.gg/omakase" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">omakase</Link>
      </p>
    </footer>
  );
}