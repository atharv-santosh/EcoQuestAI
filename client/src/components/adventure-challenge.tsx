import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, Star, MapPin, Navigation } from "lucide-react";
import PhotoCapture from "./photo-capture";

interface Challenge {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  photoPrompt?: string;
  taskDescription?: string;
}

interface Stop {
  id: string;
  title: string;
  description: string;
  location: { lat: number; lng: number };
  address: string;
  type: 'photo' | 'trivia' | 'task';
  challenge: Challenge;
  completed: boolean;
  points: number;
}

interface AdventureChallengeProps {
  stop: Stop;
  onComplete: (stopId: string, data?: any) => void;
  onNavigate: (stop: Stop) => void;
}

export default function AdventureChallenge({ 
  stop, 
  onComplete, 
  onNavigate 
}: AdventureChallengeProps) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [taskResponse, setTaskResponse] = useState("");
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTriviaSubmit = () => {
    if (!selectedAnswer) return;
    
    setIsSubmitting(true);
    const isCorrect = selectedAnswer === stop.challenge.correctAnswer;
    
    setTimeout(() => {
      onComplete(stop.id, { 
        answer: selectedAnswer, 
        correct: isCorrect,
        points: isCorrect ? stop.points : Math.floor(stop.points * 0.5)
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleTaskSubmit = () => {
    if (!taskResponse.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(stop.id, { 
        response: taskResponse,
        points: stop.points
      });
      setIsSubmitting(false);
    }, 500);
  };

  const handlePhotoSubmit = (photoData: string) => {
    setShowPhotoCapture(false);
    onComplete(stop.id, { 
      photo: photoData,
      points: stop.points
    });
  };

  const getTypeIcon = () => {
    switch (stop.type) {
      case 'photo': return <Camera className="w-5 h-5" />;
      case 'trivia': return <Star className="w-5 h-5" />;
      case 'task': return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (stop.type) {
      case 'photo': return 'bg-blue-500';
      case 'trivia': return 'bg-purple-500';
      case 'task': return 'bg-green-500';
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg text-white ${getTypeColor()}`}>
                {getTypeIcon()}
              </div>
              <div>
                <CardTitle className="text-lg">{stop.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{stop.address}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
              {stop.points} pts
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-700">{stop.description}</p>

          {stop.completed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Challenge Completed!</span>
              </div>
              <p className="text-green-600 mt-1">You earned {stop.points} points</p>
            </div>
          ) : (
            <>
              {/* Photo Challenge */}
              {stop.type === 'photo' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Photo Challenge</h4>
                    <p className="text-blue-700 text-sm">{stop.challenge.photoPrompt}</p>
                  </div>
                  <Button 
                    onClick={() => setShowPhotoCapture(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              )}

              {/* Trivia Challenge */}
              {stop.type === 'trivia' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Trivia Question</h4>
                    <p className="text-purple-700">{stop.challenge.question}</p>
                  </div>
                  
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    {stop.challenge.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <Button 
                    onClick={handleTriviaSubmit}
                    disabled={!selectedAnswer || isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Checking..." : "Submit Answer"}
                  </Button>
                </div>
              )}

              {/* Task Challenge */}
              {stop.type === 'task' && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Task Challenge</h4>
                    <p className="text-green-700 text-sm">{stop.challenge.taskDescription}</p>
                  </div>
                  
                  <Textarea
                    placeholder="Describe what you found or completed..."
                    value={taskResponse}
                    onChange={(e) => setTaskResponse(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <Button 
                    onClick={handleTaskSubmit}
                    disabled={!taskResponse.trim() || isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Task"}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Navigation Button */}
          <Button 
            onClick={() => onNavigate(stop)}
            variant="outline"
            className="w-full"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </CardContent>
      </Card>

      {/* Photo Capture Modal */}
      <PhotoCapture
        isOpen={showPhotoCapture}
        onClose={() => setShowPhotoCapture(false)}
        onSubmit={handlePhotoSubmit}
        prompt={stop.challenge.photoPrompt}
      />
    </>
  );
}