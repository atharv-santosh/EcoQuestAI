import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, X, RotateCcw, Zap, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

interface PhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (photoData: string) => void;
  prompt?: string;
}

export default function PhotoCapture({ 
  isOpen, 
  onClose, 
  onSubmit,
  prompt = "Capture your find"
}: PhotoCaptureProps) {
  const [photoData, setPhotoData] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check camera permission status
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((result) => {
        setCameraPermission(result.state as any);
      });
    }
  }, []);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraPermission('granted');
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Add some camera effects
        ctx.filter = 'contrast(1.1) saturate(1.2)';
        ctx.drawImage(video, 0, 0);
        
        // Add timestamp overlay
        ctx.filter = 'none';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, canvas.height - 40, 200, 30);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`EcoQuest • ${new Date().toLocaleString()}`, 15, canvas.height - 20);
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoData(dataUrl);
      
      // Stop camera with animation
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadProgress(0);
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhotoData(dataUrl);
        setUploadProgress(100);
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (photoData) {
      onSubmit(photoData);
      setPhotoData("");
      setUploadProgress(0);
      onClose();
    }
  };

  const handleClose = () => {
    // Stop camera if running
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setPhotoData("");
    setUploadProgress(0);
    setIsProcessing(false);
    onClose();
  };

  const retakePhoto = () => {
    setPhotoData("");
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-nature rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">{prompt}</DialogTitle>
              <p className="text-sm text-gray-600">Capture or upload your eco-discovery</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Camera View */}
          {isCapturing ? (
            <div className="relative overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
              />
              
              {/* Camera UI Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white" />
                  ))}
                </div>
                
                {/* Corner focus indicators */}
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
              </div>

              {/* Capture Button */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                <Button
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  className="rounded-full w-16 h-16 bg-white hover:bg-gray-100 text-gray-900 shadow-2xl"
                  size="sm"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
          ) : photoData ? (
            /* Photo Preview */
            <div className="relative group">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={photoData}
                  alt="Captured photo"
                  className="w-full h-64 object-cover"
                />
                
                {/* Photo Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={retakePhoto}
                      size="sm"
                      variant="secondary"
                      className="rounded-full w-10 h-10 p-0 bg-white bg-opacity-80 hover:bg-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setPhotoData("")}
                      size="sm"
                      variant="destructive"
                      className="rounded-full w-10 h-10 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Photo Info */}
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-eco-green">
                  <CheckCircle className="w-4 h-4" />
                  <span>Photo ready for submission</span>
                </div>
                <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            /* Upload Area */
            <div className="relative">
              <div 
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-eco-green/5 hover:to-forest-green/5 transition-all duration-200 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-eco-green bg-opacity-10 rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-eco-green" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900 mb-1">Upload your eco-discovery</p>
                  <p className="text-sm text-gray-600">Click to browse or drag and drop</p>
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-48">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1 text-center">{Math.round(uploadProgress)}% uploaded</p>
                  </div>
                )}
              </div>

              {/* Permission Warning */}
              {cameraPermission === 'denied' && (
                <div className="absolute top-2 left-2 right-2 bg-orange-100 border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-orange-800">Camera access denied. Use upload instead.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {!isCapturing && !photoData && (
              <>
                <Button 
                  onClick={startCamera} 
                  className="flex-1 bg-gradient-nature hover:opacity-90"
                  disabled={cameraPermission === 'denied'}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {cameraPermission === 'denied' ? 'Camera Blocked' : 'Take Photo'}
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </>
            )}
            
            {photoData && (
              <>
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-gradient-nature hover:opacity-90"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Submit Photo
                </Button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
