import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Smartphone, Download, Share } from "lucide-react";

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      return;
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Show prompt after a delay on mobile devices
    if (isIOSDevice || isAndroidDevice) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  const handleNeverShow = () => {
    setIsVisible(false);
    localStorage.setItem('install-prompt-dismissed', 'permanent');
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <Card className="bg-emerald-600 border-none text-white rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="bg-white/20 p-2 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Install EcoQuest AI</p>
                <p className="text-xs text-emerald-100">
                  {isIOS && "Tap Share → Add to Home Screen"}
                  {isAndroid && "Tap menu → Add to Home screen"}
                  {!isIOS && !isAndroid && "Install for the best experience"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isIOS && (
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                  <Share className="w-3 h-3" />
                  <span className="text-xs">Share</span>
                </div>
              )}
              {isAndroid && (
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded">
                  <Download className="w-3 h-3" />
                  <span className="text-xs">Install</span>
                </div>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-xs text-emerald-100">
              Get native app experience with offline access
            </div>
            <Button
              onClick={handleNeverShow}
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-100 hover:bg-white/20 h-6"
            >
              Don't show again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}