'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

// Fix for default marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    status?: 'active' | 'inactive' | 'alert' | string;
    description?: React.ReactNode;
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    className?: string;
    onMarkerClick?: (id: string) => void;
}

// Component to handle map center updates
function MapUpdater({ center, zoom, markers }: { center: [number, number]; zoom: number; markers: MapMarker[] }) {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 1) {
            const validMarkers = markers.filter(m => m.lat !== null && m.lng !== null && !isNaN(m.lat) && !isNaN(m.lng));
            if (validMarkers.length > 1) {
                const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
                map.fitBounds(bounds, { padding: [50, 50] });
                return;
            }
        }
        map.setView(center, zoom);
    }, [center, zoom, markers, map]);
    return null;
}

const LeafletMap = ({ center, zoom = 13, markers = [], className, onMarkerClick }: MapProps) => {
    const [tooltipDirections, setTooltipDirections] = useState<Record<string, 'top' | 'bottom' | 'left' | 'right'>>({});

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className={clsx("h-full w-full z-0", className)}
            style={{ minHeight: '300px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} zoom={zoom} markers={markers} />

            {markers.map((marker) => {
                // Determine color based on status
                const color =
                    marker.status === 'alert' ? '#ef4444' :
                        marker.status === 'active' ? '#22c55e' :
                            marker.status === 'inactive' ? '#ef4444' : '#3b82f6';

                const dir = tooltipDirections[marker.id] || 'auto';
                const offset: [number, number] = 
                    dir === 'bottom' ? [0, 15] :
                    dir === 'top' ? [0, -15] :
                    dir === 'left' ? [-15, 0] :
                    dir === 'right' ? [15, 0] : [0, -10];

                return (
                    <CircleMarker
                        key={marker.id}
                        center={[marker.lat, marker.lng]}
                        radius={10}
                        pathOptions={{
                            color: 'white',
                            weight: 2,
                            fillColor: color,
                            fillOpacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => onMarkerClick && onMarkerClick(marker.id),
                            mouseover: (e) => {
                                const map = e.target._map;
                                if (!map) return;
                                const pt = map.latLngToContainerPoint([marker.lat, marker.lng]);
                                const h = map.getSize().y;
                                const w = map.getSize().x;
                                let calculatedDir: 'top' | 'bottom' | 'left' | 'right' = 'right';
                                
                                if (pt.y < 240) {
                                    // Close to top -> show below marker
                                    calculatedDir = 'bottom';
                                } else if (h - pt.y < 240) {
                                    // Close to bottom -> show above marker
                                    calculatedDir = 'top';
                                } else if (pt.x < w / 2) {
                                    // On the left side -> show on the right of marker
                                    calculatedDir = 'right';
                                } else {
                                    // On the right side -> show on the left of marker
                                    calculatedDir = 'left';
                                }
                                
                                setTooltipDirections(prev => {
                                    if (prev[marker.id] === calculatedDir) return prev;
                                    return { ...prev, [marker.id]: calculatedDir };
                                });
                            }
                        }}
                    >
                        <Tooltip 
                            key={`${marker.id}-${dir}`}
                            direction={dir} 
                            offset={offset} 
                            opacity={1}
                        >
                            {typeof marker.description === 'string' ? (
                                <div className="p-0.5 max-w-[200px]">
                                    <span className="font-bold block border-b pb-0.5 mb-1 text-slate-800">{marker.title}</span>
                                    <span className="text-xs font-normal text-slate-600">{marker.description}</span>
                                </div>
                            ) : marker.description ? (
                                <div className="text-xs font-normal">{marker.description}</div>
                            ) : (
                                <span className="font-bold">{marker.title}</span>
                            )}
                        </Tooltip>
                        {/* <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
                                <p className="text-xs text-gray-600 mb-2">{marker.description}</p>
                                {onMarkerClick && (
                                    <button 
                                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                                        onClick={() => onMarkerClick(marker.id)}
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                        </Popup> */}
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
};

export default LeafletMap;
