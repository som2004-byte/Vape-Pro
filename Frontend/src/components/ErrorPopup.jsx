import React, { useEffect } from 'react';

export default function ErrorPopup({ error, onClose, duration = 5000 }) {
  useEffect(() => {
    if (error && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [error, duration, onClose]);

  if (!error) return null;

  const getErrorDetails = (error) => {
    // Handle different error types
    if (typeof error === 'string') {
      return { title: 'Error', message: error };
    }
    
    if (error.message) {
      // Check for common error patterns
      if (error.message.includes('CORS')) {
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          technical: error.message
        };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          title: 'Network Error',
          message: 'Could not reach the server. Please try again later.',
          technical: error.message
        };
      }
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return {
          title: 'Authentication Required',
          message: 'Please log in to continue.',
          technical: error.message
        };
      }
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return {
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          technical: error.message
        };
      }
      
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return {
          title: 'Not Found',
          message: 'The requested resource could not be found.',
          technical: error.message
        };
      }
      
      if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          technical: error.message
        };
      }
      
      return {
        title: 'Error',
        message: error.message,
        technical: error.stack
      };
    }
    
    return {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      technical: JSON.stringify(error)
    };
  };

  const { title, message, technical } = getErrorDetails(error);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full bg-gradient-to-br from-red-900/95 via-red-800/95 to-red-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border-2 border-red-500/50 overflow-hidden animate-slideDown">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Error Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-white/90 text-sm leading-relaxed mb-3">
            {message}
          </p>
          
          {technical && (
            <details className="mt-3">
              <summary className="text-xs text-white/60 hover:text-white/80 cursor-pointer font-medium">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-black/30 rounded-lg">
                <code className="text-xs text-red-200/80 break-all font-mono">
                  {technical}
                </code>
              </div>
            </details>
          )}
        </div>

        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-red-950/50">
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-red-300 animate-shrink"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
