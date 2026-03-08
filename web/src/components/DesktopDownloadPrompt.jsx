import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function DesktopDownloadPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    // Add delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      // Check if user is on desktop and not already using the app
      const isDesktop = window.innerWidth >= 1024;
      const isElectron = window.electron !== undefined;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Check localStorage - but with expiry (show again after 7 days)
      const dismissedData = localStorage.getItem('hideDesktopPrompt');
      let shouldShow = true;
      
      if (dismissedData) {
        try {
          const { timestamp } = JSON.parse(dismissedData);
          const daysSinceDismissed = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
          
          // Show again after 7 days
          if (daysSinceDismissed < 7) {
            shouldShow = false;
          } else {
            // Clear old data
            localStorage.removeItem('hideDesktopPrompt');
          }
        } catch (e) {
          // Invalid data, clear it
          localStorage.removeItem('hideDesktopPrompt');
        }
      }

      console.log('🔍 Desktop Download Prompt:', {
        isDesktop,
        isElectron,
        isMobile,
        shouldShow,
        width: window.innerWidth
      });

      // Show prompt if: desktop size, not electron, not mobile, and not recently dismissed
      if (isDesktop && !isElectron && !isMobile && shouldShow) {
        console.log('✅ Showing desktop download prompt');
        setShowPrompt(true);
        
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) setPlatform('windows');
        else if (userAgent.includes('mac')) setPlatform('mac');
        else if (userAgent.includes('linux')) setPlatform('linux');
        else setPlatform('windows'); // default
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store with timestamp so we can show again after 7 days
    localStorage.setItem('hideDesktopPrompt', JSON.stringify({
      timestamp: Date.now(),
      dismissed: true
    }));
    console.log('🚫 Desktop download prompt dismissed (will show again in 7 days)');
  };

  const handleDownload = () => {
    // This will be the download link to your GitHub releases or hosting
    const downloadLinks = {
      windows: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat-Setup.exe',
      mac: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat.dmg',
      linux: 'https://github.com/YOUR_USERNAME/whisper/releases/latest/download/Whisper-Chat.AppImage'
    };

    // For now, show alert - you'll replace this with actual download links
    alert(`Desktop app coming soon!\n\nPlatform: ${platform}\n\nYou can build it locally with: npm run electron:build`);
    
    // Uncomment when you have releases:
    // window.open(downloadLinks[platform], '_blank');
    
    handleDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="bg-base-100 shadow-2xl rounded-lg border border-base-300 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-base-content mb-1">
              Get the Desktop App
            </h3>
            <p className="text-sm text-base-content/70 mb-3">
              Download Whisper Chat for a better desktop experience with native notifications and faster performance.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-sm"
              >
                <Download className="w-4 h-4" />
                Download for {platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}
              </button>
              <button
                onClick={handleDismiss}
                className="btn btn-ghost btn-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="shrink-0 btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
