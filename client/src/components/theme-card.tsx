import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trees, ShoppingBag, Flower, Utensils, MapPin, Sparkles, Clock, Users } from "lucide-react";

interface ThemeCardProps {
  theme: string;
  title: string;
  description: string;
  stops: string;
  selected: boolean;
  onClick: () => void;
}

const themeIcons = {
  'urban-nature': Trees,
  'sustainable-shopping': ShoppingBag,
  'pollinator-hunt': Flower,
  'zero-waste-picnic': Utensils,
};

const themeData = {
  'urban-nature': {
    gradient: 'bg-gradient-nature',
    colorClass: 'bg-eco-green bg-opacity-20 text-eco-green',
    bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    difficulty: 'Easy',
    duration: '45 min',
    popularity: '4.8',
    tags: ['Parks', 'Wildlife', 'Photography']
  },
  'sustainable-shopping': {
    gradient: 'bg-gradient-sunset',
    colorClass: 'bg-nature-amber bg-opacity-20 text-nature-amber',
    bgImage: 'https://images.unsplash.com/photo-1573821663912-6df460f9c684?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    difficulty: 'Medium',
    duration: '60 min',
    popularity: '4.6',
    tags: ['Local Shops', 'Eco-friendly', 'Community']
  },
  'pollinator-hunt': {
    gradient: 'bg-gradient-to-r from-yellow-400 to-pink-400',
    colorClass: 'bg-yellow-400 bg-opacity-20 text-yellow-600',
    bgImage: 'https://images.unsplash.com/photo-1500740516770-92bd004b996e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    difficulty: 'Easy',
    duration: '30 min',
    popularity: '4.9',
    tags: ['Flowers', 'Bees', 'Nature']
  },
  'zero-waste-picnic': {
    gradient: 'bg-gradient-ocean',
    colorClass: 'bg-blue-500 bg-opacity-20 text-blue-600',
    bgImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
    difficulty: 'Medium',
    duration: '75 min',
    popularity: '4.7',
    tags: ['Sustainable', 'Food', 'Zero-waste']
  },
};

export default function ThemeCard({ 
  theme, 
  title, 
  description, 
  stops, 
  selected, 
  onClick 
}: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = themeIcons[theme as keyof typeof themeIcons] || Trees;
  const data = themeData[theme as keyof typeof themeData] || themeData['urban-nature'];

  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform ${
        selected 
          ? 'ring-4 ring-eco-green ring-opacity-50 scale-105 shadow-2xl' 
          : isHovered 
            ? 'scale-102 shadow-xl' 
            : 'shadow-lg hover:shadow-xl'
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={data.bgImage} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
        />
        <div className={`absolute inset-0 ${data.gradient} opacity-80`} />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Content */}
      <div className="relative p-4 text-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-14 h-14 glass rounded-2xl flex items-center justify-center animate-pulse-soft`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          {selected && (
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-1 animate-scale-in">
              <Sparkles className="w-4 h-4 text-nature-amber" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2 drop-shadow-sm">{title}</h4>
          <p className="text-sm text-white text-opacity-90 mb-3 line-clamp-2">{description}</p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center glass px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 mr-1" />
              <span>{data.duration}</span>
            </div>
            <div className="flex items-center glass px-2 py-1 rounded-full">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{stops}</span>
            </div>
          </div>
          
          <div className="flex items-center glass px-2 py-1 rounded-full">
            <Users className="w-3 h-3 mr-1" />
            <span>{data.popularity}★</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          <span 
            className={`text-xs px-2 py-1 rounded-full ${
              data.difficulty === 'Easy' 
                ? 'bg-eco-green bg-opacity-80' 
                : data.difficulty === 'Medium'
                  ? 'bg-nature-amber bg-opacity-80'
                  : 'bg-coral-red bg-opacity-80'
            }`}
          >
            {data.difficulty}
          </span>
        </div>

        {/* Animated Selection Indicator */}
        {selected && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-nature-amber via-eco-green to-nature-amber animate-gradient" />
        )}
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && !selected && (
        <div className="absolute inset-0 bg-white bg-opacity-5 animate-scale-in" />
      )}
    </Card>
  );
}
