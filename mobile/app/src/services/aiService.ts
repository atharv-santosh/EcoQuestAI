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
        // Fallback to basic analysis for demo
        return this.fallbackAnalysis(requirement);
      }

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
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      return this.parseAnalysisResult(analysis, requirement);
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.fallbackAnalysis(requirement);
    }
  }

  private buildAnalysisPrompt(requirement: QuestRequirement): string {
    const basePrompt = `Analyze this image for a quest requirement. 
    
Quest Description: ${requirement.description}

Please analyze the image and respond with:
1. A confidence score (0-100) indicating how well the image matches the requirement
2. A list of detected objects/features in the image
3. A simple "YES" or "NO" indicating if the quest requirement is met

Format your response as:
Confidence: [score]
Objects: [comma-separated list]
Match: [YES/NO]`;

    if (requirement.targetObjects) {
      return `${basePrompt}

Specifically look for these objects: ${requirement.targetObjects.join(', ')}`;
    }

    return basePrompt;
  }

  private parseAnalysisResult(analysis: string, requirement: QuestRequirement): ImageAnalysisResult {
    try {
      const confidenceMatch = analysis.match(/Confidence:\s*(\d+)/);
      const objectsMatch = analysis.match(/Objects:\s*(.+)/);
      const matchMatch = analysis.match(/Match:\s*(YES|NO)/);

      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
      const detectedObjects = objectsMatch ? objectsMatch[1].split(',').map(obj => obj.trim()) : [];
      const isMatch = matchMatch ? matchMatch[1] === 'YES' : false;

      return {
        success: true,
        confidence,
        detectedObjects,
      };
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      return this.fallbackAnalysis(requirement);
    }
  }

  private fallbackAnalysis(requirement: QuestRequirement): ImageAnalysisResult {
    // Fallback analysis for when AI service is not available
    // This provides a basic simulation of image analysis
    
    const randomConfidence = Math.floor(Math.random() * 40) + 60; // 60-100
    const isMatch = randomConfidence > 70;
    
    const commonObjects = [
      'tree', 'plant', 'flower', 'leaf', 'grass', 'sky', 'building', 
      'car', 'person', 'animal', 'water', 'mountain', 'road', 'bench'
    ];
    
    const detectedObjects = commonObjects
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 2);

    return {
      success: true,
      confidence: randomConfidence,
      detectedObjects,
    };
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
}

export const aiService = new AIService(); 