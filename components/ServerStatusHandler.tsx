// components/ServerStatusHandler.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface ServerStatusHandlerProps {
  children: ReactNode;
}

const ServerStatusHandler: React.FC<ServerStatusHandlerProps> = ({ children }) => {
  const [isServerDown, setIsServerDown] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Fungsi untuk memeriksa status server
    const checkServerStatus = async (): Promise<void> => {
      try {
        const response = await fetch('/api/health-check', { 
          cache: 'no-store',
          headers: { 'pragma': 'no-cache' }
        });
        if (!response.ok) {
          throw new Error('Server not responding properly');
        }
        setIsServerDown(false);
      } catch (error) {
        console.error('Server down:', error);
        setIsServerDown(true);
        
        // Jika offline dan PWA sudah di-cache, router akan mengarahkan ke halaman offline
        if (!navigator.onLine) {
          router.push('/offline');
        }
      }
    };

    // Periksa status server saat komponen dimuat
    checkServerStatus();

    // Atur interval untuk memeriksa status server secara berkala
    const interval = setInterval(checkServerStatus, 30000); // Periksa setiap 30 detik

    // Event listener untuk status koneksi
    const handleOnline = () => {
      checkServerStatus();
    };
    
    const handleOffline = () => {
      setIsServerDown(true);
      router.push('/offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  // Jika server down dan pengguna online (berarti hanya server yang bermasalah),
  // tampilkan pesan server down di aplikasi
  if (isServerDown && navigator.onLine) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f9fafc',
        padding: '1rem'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          color: '#0055ff', 
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Server Tidak Tersedia
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          maxWidth: '400px',
          color: '#4a5568',
          marginBottom: '1.5rem'
        }}>
          Mohon maaf, server Fans Cosa sedang tidak dapat diakses. Silakan coba beberapa saat lagi.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0055ff',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0, 85, 255, 0.15)'
          }}
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ServerStatusHandler;