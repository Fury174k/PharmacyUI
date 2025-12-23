import { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string | Record<string, any>; // can handle string or object errors
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  // ✅ Normalize error messages
  const formattedMessage =
    typeof message === 'string'
      ? message
      : message?.message ||
        message?.detail ||
        Object.entries(message || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') ||
        'An unexpected error occurred.';

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm whitespace-pre-line`}
    >
      {formattedMessage}
    </div>
  );
};
