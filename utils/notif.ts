import { toast } from 'react-hot-toast';

// Notifikasi sukses
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 2000,
    position: 'top-right',
    style: {
      background: '#4CAF50',
      color: 'white',
    },
  });
};

// Notifikasi error
export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 2000,
    position: 'top-right',
    style: {
      background: '#F44336',
      color: 'white',
    },
  });
};

// Notifikasi untuk data yang ditambahkan
export const showAddToast = (message: string) => {
    toast.success(message, {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#4CAF50',
        color: 'white',
      },
    });
  };

// Notifikasi untuk data yang dihapus
export const showDeleteToast = (message: string) => {
  toast(message, {
    duration: 2000,
    position: 'top-right',
    style: {
      background: '#FF9800',
      color: 'white',
    },
    icon: '🗑️',
  });
};

// Notifikasi untuk data yang diubah
export const showUpdateToast = (message: string) => {
  toast(message, {
    duration: 2000,
    position: 'top-right',
    style: {
      background: '#4CAF50',
      color: 'white',
    },
    icon: '📝',
  });
};

