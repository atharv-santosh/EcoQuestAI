# AI Photo Detection Setup

## Overview
The EcoQuestAI app uses OpenAI's GPT-4 Vision API to analyze photos for quest completion. This provides intelligent, accurate detection of objects and features in user-submitted photos.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in your dashboard
4. Create a new API key
5. Copy the API key (starts with `sk-`)

### 2. Add API Key to Environment
Create or update your `.env` file in the `mobile/app` directory:

```bash
# Add this line to your .env file
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Restart the App
After adding the API key, restart your development server:
```bash
npm start
```

## How It Works

### AI Analysis Process
1. **Photo Submission**: User takes a photo for a quest
2. **Image Processing**: Photo is converted to base64 format
3. **AI Analysis**: OpenAI Vision API analyzes the image
4. **Quest Validation**: AI determines if the photo matches quest requirements
5. **User Feedback**: Results are shown with confidence score and detected objects

### Quest Types Supported
- **Nature Quests**: Trees, plants, wildlife, natural features
- **Sustainability Quests**: Recycling bins, solar panels, green buildings
- **Exploration Quests**: Landmarks, architecture, interesting locations
- **Community Quests**: Public spaces, community features

### AI Response Format
The AI provides structured responses:
```
Confidence: 85
Objects: oak tree, green leaves, natural environment
Match: YES
```

## Fallback Mode
If no API key is provided, the app uses intelligent fallback analysis that:
- Generates realistic confidence scores based on quest type
- Provides relevant object detection
- Maintains app functionality for testing

## Cost Considerations
- OpenAI Vision API costs approximately $0.01-0.03 per image analysis
- Typical usage: 5-20 analyses per user per day
- Consider implementing rate limiting for production use

## Troubleshooting

### Common Issues
1. **"No OpenAI API key found"**: Add your API key to `.env`
2. **API errors**: Check your API key validity and billing status
3. **Slow responses**: Vision API can take 2-5 seconds per analysis

### Testing AI
To verify AI is working:
1. Add your API key
2. Take a photo for any quest
3. Check console logs for "Starting AI image analysis..."
4. Look for "AI response received:" in logs

## Security Notes
- Never commit your API key to version control
- Use environment variables for all API keys
- Consider implementing API key rotation for production 