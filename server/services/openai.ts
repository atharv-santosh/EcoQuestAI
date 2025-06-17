import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key-here"
});

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GenerateRouteParams {
  theme: string;
  location: Location;
  radius?: number; // in kilometers, default 2
}

interface RouteStop {
  id: string;
  title: string;
  description: string;
  location: { lat: number; lng: number };
  address: string;
  type: 'photo' | 'trivia' | 'task';
  challenge: {
    question?: string;
    options?: string[];
    correctAnswer?: string;
    photoPrompt?: string;
    taskDescription?: string;
  };
  completed: boolean;
  points: number;
}

export async function generateEcoRoute({
  theme,
  location,
  radius = 2
}: GenerateRouteParams): Promise<{
  title: string;
  description: string;
  stops: RouteStop[];
  totalPoints: number;
}> {
  const themePrompts = {
    'urban-nature': 'Focus on parks, green spaces, urban gardens, street trees, and wildlife habitats within the city',
    'sustainable-shopping': 'Include eco-friendly stores, farmers markets, zero-waste shops, organic food stores, and sustainable businesses',
    'pollinator-hunt': 'Target locations with native flowers, community gardens, bee-friendly plants, butterfly habitats, and pollinator conservation areas',
    'zero-waste-picnic': 'Find locations for sustainable picnic preparation including bulk stores, reusable container shops, compost sites, and scenic picnic spots'
  };

  const prompt = `Create an eco-friendly treasure hunt route for the theme "${theme}" near ${location.address || `${location.lat}, ${location.lng}`}.

Theme focus: ${themePrompts[theme as keyof typeof themePrompts] || 'General eco-friendly activities'}

Requirements:
- Generate 5-7 stops within a ${radius}km radius
- Each stop should be walkable or bikeable from the previous one
- Include a mix of photo challenges, trivia questions, and tasks
- Make challenges educational and fun
- Award 15-30 points per stop based on difficulty
- Ensure locations are realistic and accessible

For each stop, provide:
- Realistic address and approximate coordinates (slight variations from the center point)
- Clear challenge instructions
- Educational content related to sustainability/ecology
- Appropriate point values

Return the response in this exact JSON format:
{
  "title": "Quest title",
  "description": "Brief description of the hunt",
  "stops": [
    {
      "id": "stop1",
      "title": "Location name",
      "description": "What to do here",
      "location": {"lat": number, "lng": number},
      "address": "Street address",
      "type": "photo|trivia|task",
      "challenge": {
        "photoPrompt": "What to photograph (if type is photo)",
        "question": "Trivia question (if type is trivia)",
        "options": ["A", "B", "C", "D"] (if type is trivia),
        "correctAnswer": "Correct option (if type is trivia)",
        "taskDescription": "Task to complete (if type is task)"
      },
      "completed": false,
      "points": number
    }
  ],
  "totalPoints": total_points_sum
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating educational eco-friendly treasure hunts. Generate realistic, accessible routes with meaningful environmental challenges."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate the response structure
    if (!result.title || !result.stops || !Array.isArray(result.stops)) {
      throw new Error('Invalid response format from OpenAI');
    }

    return result;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(`Failed to generate eco route: ${error.message}`);
  }
}

export async function generateHint(challenge: any): Promise<string> {
  const prompt = `Provide a helpful hint for this eco-treasure hunt challenge without giving away the answer:
  
Challenge: ${JSON.stringify(challenge)}

Give a friendly, encouraging hint that guides the participant in the right direction.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful eco-treasure hunt guide. Provide encouraging hints that help without spoiling the challenge."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content || 'Keep exploring! You\'re on the right track.';
  } catch (error) {
    console.error('Error generating hint:', error);
    return 'Keep exploring! Look around for clues related to nature and sustainability.';
  }
}
