import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

// Simplified version for testing - always shows on desktop
export default function DesktopDownloadPromptSimple() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState('windows');

  useEffect(() => {
    // Simple check - just desktop size
    const checkAndShow = () => {
      const isDesktop = window.innerWidth >= 1024;
      console.log('Desktop check:', { width: window.innerWidth, isDesktop });
      
      if (isDesktop) {
        setShowPrompt(true);
        
        // Detect platform
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('mac')) setPlatform('mac');
        else if (ua.includes('linux')) setPlatform('linux');
        else setPlatform('windows');
      }
    };

    // Check after a short delay
    setTimeout(checkAndShow, 500);
  }, []);

  if (!showPrompt) {
    console.log('Prompt not showing');
    return null;
  }

  console.log('Rendering desktop prompt');

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border-2 border-blue-500 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              Get the Desktop App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Download Whisper Chat for {platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Desktop app coming soon!\n\nBuild it with: npm run electron:build');
                  setShowPrompt(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowPrompt(false)}
            className="shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
