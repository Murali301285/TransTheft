'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./LeafletMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
            Loading Map...
        </div>
    ),
});

export default MapView;
