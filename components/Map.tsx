'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { getRequest } from '@/utils/apiClient';

const customMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  center: [number, number];
  zoom: number;
}

const Map = ({ center, zoom }: MapProps): JSX.Element => {
  const [setting, setSetting] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMapSetting = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) {
          router.replace('/login');
          return;
        }

        const settingRes = await getRequest('/api/setting');
        if (settingRes.status === 'success') {
          setSetting(settingRes.data);
          console.log('✅ Map setting loaded');
        } else {
          setError('Gagal memuat pengaturan lokasi.');
        }
      } catch (err) {
        console.error('❌ Error loading map setting:', err);
        setError('Terjadi kesalahan saat mengambil data peta.');
      }
    };

    fetchMapSetting();
  }, [router]);

  // Tampilkan error jika ada
  if (error) {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666',
        fontSize: '14px'
      }}>
        {error}
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={customMarkerIcon}>
        <Popup>
          <strong>{setting?.name ?? 'Loading nama lokasi...'}</strong>
          <br />
          Titik lokasi berada di sini.
          <br />
          Koordinat: {center[0]}, {center[1]}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;