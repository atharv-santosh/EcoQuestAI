import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhotoData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (photoData) {
      onSubmit(photoData);
      setPhotoData("");
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{prompt}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isCapturing ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-48 bg-gray-100 rounded-lg object-cover"
                playsInline
              />
              <Button
                onClick={capturePhoto}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full w-12 h-12"
                size="sm"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          ) : photoData ? (
            <div className="relative">
              <img
                src={photoData}
                alt="Captured photo"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                onClick={() => setPhotoData("")}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center space-y-2">
              <Camera className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500 text-center">
                Take a photo or upload from gallery
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            {!isCapturing && !photoData && (
              <>
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
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
                <Button onClick={handleSubmit} className="flex-1">
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
