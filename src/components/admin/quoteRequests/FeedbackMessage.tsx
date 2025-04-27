import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface FeedbackMessageProps {
  message: { type: 'success' | 'error', text: string } | null;
  setMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
  autoHideDuration?: number;
}

const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  setMessage,
  autoHideDuration = 3000
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [message, setMessage, autoHideDuration]);

  if (!message) return null;

  const { type, text } = message;

  return (
    <div className={`fixed top-24 right-4 z-50 max-w-md animate-slide-in-right`}>
      <div 
        className={`flex items-center p-4 rounded-lg shadow-lg border ${type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'}`}
      >
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="ml-3 mr-8">
          <p className="text-sm font-medium">{text}</p>
        </div>
        <button
          onClick={() => setMessage(null)}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
        >
          <span className="sr-only">Fermer</span>
          <X className={`h-4 w-4 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`} />
        </button>
      </div>
    </div>
  );
};

export { FeedbackMessage };