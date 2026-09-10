'use client';

interface TransformerLoaderProps {
    className?: string;
    text?: string;
}

export function TransformerLoader({ className, text = "Loading data..." }: TransformerLoaderProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-8 select-none w-full">
            {/* Custom Transformer SVG Animation */}
            <div className="relative flex items-center justify-center">
                {/* Radial Glow Background */}
                <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-xl animate-pulse w-24 h-24" />
                
                <svg viewBox="0 0 100 80" className="w-28 h-24 relative z-10 text-slate-800 dark:text-slate-200">
                    <defs>
                        {/* Define gradients for premium looks */}
                        <linearGradient id="primaryCoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="secondaryCoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    
                    {/* Magnetic Field Waves (Left and Right curved arches) */}
                    <path 
                        d="M 22 15 C 10 15, 10 65, 22 65" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                        className="opacity-40 animate-[dash_1.5s_linear_infinite]" 
                        style={{ strokeDashoffset: 0 }}
                    />
                    <path 
                        d="M 78 15 C 90 15, 90 65, 78 65" 
                        fill="none" 
                        stroke="#06b6d4" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4" 
                        className="opacity-40 animate-[dash_1.5s_linear_infinite_reverse]" 
                        style={{ strokeDashoffset: 0 }}
                    />
                    
                    {/* Transformer Iron Core (Silicon Steel Laminations) */}
                    <rect x="25" y="15" width="50" height="50" rx="6" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-300 dark:text-slate-700" />
                    <rect x="37" y="27" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 dark:text-slate-700 opacity-80" />
                    
                    {/* Left Coil (Primary Winding - Copper Coils) */}
                    {/* 5 coils */}
                    <path d="M 23 20 C 14 20, 14 25, 23 25" fill="none" stroke="url(#primaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 23 27 C 14 27, 14 32, 23 32" fill="none" stroke="url(#primaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 23 34 C 14 34, 14 39, 23 39" fill="none" stroke="url(#primaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 23 41 C 14 41, 14 46, 23 46" fill="none" stroke="url(#primaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 23 48 C 14 48, 14 53, 23 53" fill="none" stroke="url(#primaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Right Coil (Secondary Winding) */}
                    <path d="M 77 20 C 86 20, 86 25, 77 25" fill="none" stroke="url(#secondaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 77 27 C 86 27, 86 32, 77 32" fill="none" stroke="url(#secondaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 77 34 C 86 34, 86 39, 77 39" fill="none" stroke="url(#secondaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 77 41 C 86 41, 86 46, 77 46" fill="none" stroke="url(#secondaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 77 48 C 86 48, 86 53, 77 53" fill="none" stroke="url(#secondaryCoilGrad)" strokeWidth="3" strokeLinecap="round" />

                    {/* Left & Right connecting wire terminals */}
                    <line x1="12" y1="20" x2="23" y2="20" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="53" x2="23" y2="53" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="77" y1="20" x2="88" y2="20" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="77" y1="53" x2="88" y2="53" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Central Lightning Bolt / Zap Icon representing energy conversion */}
                    <path 
                        d="M 50 20 L 41 38 L 49 38 L 47 57 L 59 38 L 51 38 Z" 
                        fill="#eab308" 
                        filter="url(#glow)" 
                        className="animate-[pulse_1s_ease-in-out_infinite]"
                    />
                </svg>
            </div>
            
            <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent animate-pulse tracking-wide">
                    {text}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
                    Monitoring Grid Activity
                </span>
            </div>

            <style jsx global>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -20;
                    }
                }
            `}</style>
        </div>
    );
}
