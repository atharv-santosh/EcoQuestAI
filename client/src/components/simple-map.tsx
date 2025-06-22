import React from "react";
import { MapPin } from "lucide-react";

interface SimpleMapProps {
  stops: any[];
  userLocation?: { lat: number; lng: number };
  onStopClick?: (stop: any) => void;
  className?: string;
}

export default function SimpleMap({ stops, userLocation, onStopClick, className }: SimpleMapProps) {
  return (
    <div className={`bg-emerald-50 rounded-lg p-4 ${className}`}>
      <div className="text-center mb-4">
        <MapPin className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-gray-700 font-medium">Adventure Map</p>
        <p className="text-sm text-gray-600">Click stops below to view challenges</p>
      </div>
      
      <div className="space-y-2">
        {stops?.map((stop, index) => (
          <div
            key={stop.id}
            onClick={() => onStopClick?.(stop)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              stop.completed 
                ? 'bg-green-100 border-green-300' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  stop.completed ? 'bg-green-600' : 'bg-emerald-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{stop.title}</p>
                  <p className="text-xs text-gray-600">{stop.address}</p>
                </div>
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                {stop.points} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}