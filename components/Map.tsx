// components/Map.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// [LANGKAH 1] Hapus impor gambar lokal yang sebelumnya ada.
// import markerIconPng from 'leaflet/dist/images/marker-icon.png';
// import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';


// [LANGKAH 2] Buat objek ikon kustom menggunakan URL dari CDN.
const customMarkerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface MapProps {
  center: [number, number];
  zoom: number;
}

const Map = ({ center, zoom }: MapProps): JSX.Element => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={customMarkerIcon}>
        <Popup>
          Titik lokasi berada di sini. <br /> Koordinat: {center[0]}, {center[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;