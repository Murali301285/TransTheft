import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-10" />

      <div className="z-10 text-center space-y-8 max-w-2xl glass p-12 rounded-2xl animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
            Transformer Guard
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Advanced Theft Monitoring & Intelligent Alert System
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-8 py-3 rounded-full bg-[hsl(var(--primary))] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg">
            Login
          </Link>
          <button className="px-8 py-3 rounded-full border border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-semibold hover:bg-[hsl(var(--primary)/0.1)] transition-colors">
            Learn More
          </button>
        </div>
      </div>

      <footer className="absolute bottom-4 text-sm text-[hsl(var(--muted-foreground))]">
        © 2026 TTM. All rights reserved.
      </footer>
    </main>
  );
}
