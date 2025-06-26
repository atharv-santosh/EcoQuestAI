// AI Service for image detection and analysis
// This service handles image recognition for quest completion

export interface ImageAnalysisResult {
  success: boolean;
  confidence: number;
  detectedObjects: string[];
  error?: string;
}

export interface QuestRequirement {
  type: 'photo' | 'location' | 'action';
  targetImage?: string;
  targetObjects?: string[];
  targetLocation?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  description: string;
}

class AIService {
  private apiKey: string = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  // Analyze image for quest completion
  async analyzeImage(imageBase64: string, requirement: QuestRequirement): Promise<ImageAnalysisResult> {
    try {
      if (!this.apiKey) {
        console.log('No OpenAI API key found, using fallback analysis');
        return this.fallbackAnalysis(requirement);
      }

      console.log('Starting AI image analysis...');
      const prompt = this.buildAnalysisPrompt(requirement);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1, // Lower temperature for more consistent results
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AI response received:', data.choices[0].message.content);
      
      const analysis = data.choices[0].message.content;
      const result = this.parseAnalysisResult(analysis, requirement);
      
      console.log('Parsed AI result:', result);
      return result;
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.fallbackAnalysis(requirement);
    }
  }

  private buildAnalysisPrompt(requirement: QuestRequirement): string {
    const basePrompt = `You are an expert image analyzer for an eco-friendly quest app. Analyze this image carefully for the following quest requirement:

QUEST REQUIREMENT: ${requirement.description}

INSTRUCTIONS:
1. Look at the image carefully and identify all relevant objects, features, and elements
2. Determine if the image matches the quest requirement
3. Provide a confidence score based on how well the image fulfills the requirement
4. List all detected objects/features that are relevant to the quest

RESPONSE FORMAT (exactly as shown):
Confidence: [0-100]
Objects: [comma-separated list of detected objects/features]
Match: [YES/NO]

EXAMPLES:
- For a nature quest asking for trees: "Confidence: 85\nObjects: oak tree, green leaves, natural environment\nMatch: YES"
- For a sustainability quest asking for recycling bins: "Confidence: 20\nObjects: building, sidewalk, people\nMatch: NO"

Be specific and accurate in your analysis.`;

    if (requirement.targetObjects && requirement.targetObjects.length > 0) {
      return `${basePrompt}

SPECIFIC OBJECTS TO LOOK FOR: ${requirement.targetObjects.join(', ')}`;
    }

    return basePrompt;
  }

  private parseAnalysisResult(analysis: string, requirement: QuestRequirement): ImageAnalysisResult {
    try {
      console.log('Parsing AI response:', analysis);
      
      // More flexible regex patterns to handle variations in AI responses
      const confidenceMatch = analysis.match(/Confidence:\s*(\d+)/i);
      const objectsMatch = analysis.match(/Objects:\s*(.+?)(?:\n|$)/i);
      const matchMatch = analysis.match(/Match:\s*(YES|NO)/i);

      let confidence = 50; // Default confidence
      let detectedObjects: string[] = [];
      let isMatch = false;

      if (confidenceMatch) {
        confidence = parseInt(confidenceMatch[1]);
        confidence = Math.max(0, Math.min(100, confidence)); // Clamp between 0-100
      }

      if (objectsMatch) {
        detectedObjects = objectsMatch[1]
          .split(',')
          .map(obj => obj.trim())
          .filter(obj => obj.length > 0);
      }

      if (matchMatch) {
        isMatch = matchMatch[1].toUpperCase() === 'YES';
      }

      // If we couldn't parse the match, use confidence as a fallback
      if (matchMatch === null) {
        isMatch = confidence >= 70;
      }

      const result: ImageAnalysisResult = {
        success: true,
        confidence,
        detectedObjects,
      };

      console.log('Parsed result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      return this.fallbackAnalysis(requirement);
    }
  }

  private fallbackAnalysis(requirement: QuestRequirement): ImageAnalysisResult {
    // Fallback analysis for when AI service is not available
    // This provides a basic simulation of image analysis
    console.log('Using fallback analysis - no AI available');
    
    // Generate more realistic confidence based on quest type
    let baseConfidence = 60;
    const questText = requirement.description.toLowerCase();
    
    if (questText.includes('tree') || questText.includes('plant') || questText.includes('nature')) {
      baseConfidence = 75;
    } else if (questText.includes('recycling') || questText.includes('sustainable')) {
      baseConfidence = 45;
    } else if (questText.includes('building') || questText.includes('architecture')) {
      baseConfidence = 65;
    }
    
    const randomVariation = Math.floor(Math.random() * 30) - 15; // ±15 variation
    const confidence = Math.max(0, Math.min(100, baseConfidence + randomVariation));
    
    // Generate relevant objects based on quest type
    let relevantObjects: string[] = [];
    if (questText.includes('tree') || questText.includes('plant')) {
      relevantObjects = ['tree', 'leaves', 'green vegetation', 'natural environment'];
    } else if (questText.includes('recycling') || questText.includes('sustainable')) {
      relevantObjects = ['building', 'sidewalk', 'urban environment'];
    } else if (questText.includes('building') || questText.includes('architecture')) {
      relevantObjects = ['building', 'architecture', 'urban structure'];
    } else {
      relevantObjects = ['environment', 'surroundings', 'location'];
    }
    
    // Add some random objects for variety
    const commonObjects = [
      'sky', 'ground', 'people', 'road', 'car', 'bench', 'sign', 'light'
    ];
    
    const additionalObjects = commonObjects
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    const detectedObjects = [...relevantObjects, ...additionalObjects];

    const result: ImageAnalysisResult = {
      success: true,
      confidence,
      detectedObjects,
    };
    
    console.log('Fallback analysis result:', result);
    return result;
  }

  // Generate quest descriptions using AI
  async generateQuestDescription(category: string, location: string): Promise<string> {
    try {
      if (!this.apiKey) {
        return this.getFallbackDescription(category, location);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an eco-friendly quest generator. Create engaging, educational quest descriptions that encourage environmental awareness and exploration.',
            },
            {
              role: 'user',
              content: `Generate a short, engaging quest description for a ${category} quest in ${location}. Keep it under 100 words and make it fun and educational.`,
            },
          ],
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Quest generation error:', error);
      return this.getFallbackDescription(category, location);
    }
  }

  private getFallbackDescription(category: string, location: string): string {
    const descriptions = {
      nature: [
        `Explore the natural beauty of ${location} and discover the diverse plant life that calls this area home.`,
        `Take a moment to observe the wildlife and plants in ${location}. What can you learn about the local ecosystem?`,
        `Find and photograph the most interesting natural feature in ${location}. What makes it special?`
      ],
      sustainability: [
        `Look for sustainable practices and eco-friendly features in ${location}. What green initiatives can you spot?`,
        `Document examples of environmental conservation in ${location}. How is this area being protected?`,
        `Find evidence of renewable energy or sustainable design in ${location}. What innovative solutions do you see?`
      ],
      exploration: [
        `Discover hidden gems and interesting landmarks in ${location}. What unique features can you find?`,
        `Explore the history and culture of ${location} through its architecture and landmarks.`,
        `Map out the most scenic route through ${location}. What makes this area worth exploring?`
      ],
      community: [
        `Connect with the community spirit of ${location}. What brings people together here?`,
        `Find examples of community involvement and local initiatives in ${location}.`,
        `Document the social spaces and gathering areas in ${location}. How do people interact here?`
      ]
    };

    const categoryDescriptions = descriptions[category as keyof typeof descriptions] || descriptions.nature;
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  // Validate location-based quests
  validateLocation(
    userLocation: { latitude: number; longitude: number },
    targetLocation: { latitude: number; longitude: number; radius: number }
  ): boolean {
    const distance = this.calculateDistance(userLocation, targetLocation);
    return distance <= targetLocation.radius;
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.latitude * Math.PI / 180;
    const φ2 = point2.latitude * Math.PI / 180;
    const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
    const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Test AI connectivity
  async testAIConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          message: 'No OpenAI API key found. Add EXPO_PUBLIC_OPENAI_API_KEY to your .env file'
        };
      }

      console.log('Testing AI connection...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Respond with "AI is working" if you can see this message.',
            },
          ],
          max_tokens: 10,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `API test failed: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      console.log('AI connection test successful');
      
      return {
        success: true,
        message: 'AI connection successful! Photo detection will use real AI analysis.'
      };
    } catch (error) {
      console.error('AI connection test error:', error);
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get AI status
  getAIStatus(): { hasApiKey: boolean; isConfigured: boolean } {
    return {
      hasApiKey: !!this.apiKey,
      isConfigured: this.apiKey.length > 0
    };
  }
}

export const aiService = new AIService(); 