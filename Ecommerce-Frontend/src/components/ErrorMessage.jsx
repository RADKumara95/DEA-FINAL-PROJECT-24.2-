import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const ErrorMessage = ({ message, type = 'error', autoDismiss = false, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  if (!visible || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center p-4 mb-4 rounded border ${getStyles()}`}>
      <div className="mr-3">{getIcon()}</div>
      <div className="flex-1">{message}</div>
      {!autoDismiss && (
        <button
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;