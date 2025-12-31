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
    description?: string;
}

interface MapProps {
    center: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    className?: string;
    onMarkerClick?: (id: string) => void;
}

// Component to handle map center updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const LeafletMap = ({ center, zoom = 13, markers = [], className, onMarkerClick }: MapProps) => {
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
            <MapUpdater center={center} zoom={zoom} />

            {markers.map((marker) => {
                // Determine color based on status
                const color =
                    marker.status === 'alert' ? '#ef4444' :
                        marker.status === 'active' ? '#22c55e' :
                            marker.status === 'inactive' ? '#94a3b8' : '#3b82f6';

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
                            click: () => onMarkerClick && onMarkerClick(marker.id)
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            <span className="font-bold">{marker.title}</span>
                            {marker.description && <div className="text-xs font-normal">{marker.description}</div>}
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
