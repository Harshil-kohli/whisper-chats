import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function DesktopDownloadPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      const isElectron = window.electron !== undefined;
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isDesktop = window.innerWidth >= 1024;
      
      // Check sessionStorage (only for current session, not persistent)
      const dismissedThisSession = sessionStorage.getItem('hideDesktopPrompt');

      console.log('🔍 Download Prompt:', {
        isDesktop,
        isMobileDevice,
        isElectron,
        dismissedThisSession,
        width: window.innerWidth
      });

      // Show prompt if: not electron, not dismissed this session
      // Show on both desktop AND mobile
      if (!isElectron && !dismissedThisSession) {
        console.log('✅ Showing download prompt');
        setShowPrompt(true);
        setIsMobile(isMobileDevice);
        
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (isMobileDevice) {
          if (userAgent.includes('android')) setPlatform('android');
          else if (userAgent.includes('iphone') || userAgent.includes('ipad')) setPlatform('ios');
          else setPlatform('mobile');
        } else {
          if (userAgent.includes('win')) setPlatform('windows');
          else if (userAgent.includes('mac')) setPlatform('mac');
          else if (userAgent.includes('linux')) setPlatform('linux');
          else setPlatform('windows'); // default
        }
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store in sessionStorage (clears on page reload/close)
    sessionStorage.setItem('hideDesktopPrompt', 'true');
    console.log('🚫 Download prompt dismissed (will show again on page reload)');
  };

  const handleDownload = () => {
    if (isMobile) {
      // For mobile, show PWA install instructions
      const instructions = platform === 'ios' 
        ? `Install Whisper Chat on iOS:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm\n\nYou'll get a native app experience with offline support!`
        : `Install Whisper Chat on Android:\n\n1. Tap the menu (⋮) in your browser\n2. Tap "Add to Home screen" or "Install app"\n3. Tap "Install" to confirm\n\nYou'll get a native app experience with offline support!`;
      
      alert(instructions);
    } else {
      // For desktop, direct download of .exe
      const downloadUrl = '/downloads/Whisper-Chat.exe';
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'Whisper-Chat.exe';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show instructions after download starts
      setTimeout(() => {
        alert(`Download started! 📥\n\nOnce downloaded:\n1. Run "Whisper-Chat.exe"\n2. Windows may show a security warning - click "More info" then "Run anyway"\n3. Enjoy the desktop app!`);
      }, 500);
    }
    
    handleDismiss();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto z-50 max-w-md mx-auto md:mx-0">
      <div className="bg-base-100 shadow-2xl rounded-lg border border-base-300 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {isMobile ? (
                <Smartphone className="w-6 h-6 text-primary" />
              ) : (
                <Download className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-base-content mb-1">
              {isMobile ? 'Install Mobile App' : 'Get the Desktop App'}
            </h3>
            <p className="text-sm text-base-content/70 mb-3">
              {isMobile 
                ? 'Install Whisper Chat on your phone for a native app experience with offline support.'
                : 'Download Whisper Chat for a better desktop experience with native notifications and faster performance.'
              }
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleDownload}
                className="btn btn-primary btn-sm"
              >
                {isMobile ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {isMobile 
                  ? (platform === 'android' ? 'Install App' : platform === 'ios' ? 'Add to Home' : 'Install')
                  : `Download for ${platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}`
                }
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
