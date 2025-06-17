import { Card } from "@/components/ui/card";
import { Trees, ShoppingBag, Flower, Utensils, MapPin } from "lucide-react";

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

const themeColors = {
  'urban-nature': 'bg-eco-green bg-opacity-20 text-eco-green',
  'sustainable-shopping': 'bg-nature-amber bg-opacity-20 text-nature-amber',
  'pollinator-hunt': 'bg-yellow-400 bg-opacity-20 text-yellow-600',
  'zero-waste-picnic': 'bg-blue-500 bg-opacity-20 text-blue-600',
};

export default function ThemeCard({ 
  theme, 
  title, 
  description, 
  stops, 
  selected, 
  onClick 
}: ThemeCardProps) {
  const Icon = themeIcons[theme as keyof typeof themeIcons] || Trees;
  const colorClass = themeColors[theme as keyof typeof themeColors] || themeColors['urban-nature'];

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-eco-green bg-eco-green bg-opacity-5' : ''
      }`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="flex items-center text-xs text-sage-green">
        <MapPin className="w-3 h-3 mr-1" />
        <span>{stops}</span>
      </div>
    </Card>
  );
}
