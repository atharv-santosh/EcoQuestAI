// Pre-built adventures for different themes and locations
export const ADVENTURE_TEMPLATES = {
  'urban-nature': {
    title: 'Urban Nature Explorer',
    description: 'Discover hidden green spaces and urban wildlife in your city',
    templates: [
      {
        name: 'Central Park Discovery',
        location: { lat: 40.7829, lng: -73.9654 },
        radius: 1.5,
        stops: [
          {
            title: 'Bethesda Fountain',
            type: 'photo',
            points: 50,
            challenge: {
              photoPrompt: 'Take a photo of the angel statue with wildlife (birds, squirrels) in the frame'
            },
            description: 'This iconic fountain is a gathering place for both people and urban wildlife'
          },
          {
            title: 'The Mall Tree Canopy',
            type: 'trivia',
            points: 30,
            challenge: {
              question: 'What type of trees primarily line The Mall walkway?',
              options: ['Oak Trees', 'American Elm Trees', 'Maple Trees', 'Pine Trees'],
              correctAnswer: 'American Elm Trees'
            },
            description: 'Walk under the beautiful canopy and observe the urban forest'
          },
          {
            title: 'Strawberry Fields',
            type: 'task',
            points: 40,
            challenge: {
              taskDescription: 'Find and identify 3 different bird species. Record their names and behaviors.'
            },
            description: 'This peaceful area attracts many bird species year-round'
          }
        ]
      },
      {
        name: 'Brooklyn Bridge Park',
        location: { lat: 40.7021, lng: -73.9967 },
        radius: 1.2,
        stops: [
          {
            title: 'Pier 1 Granite Prospect',
            type: 'photo',
            points: 50,
            challenge: {
              photoPrompt: 'Capture the Manhattan skyline with native plants in the foreground'
            },
            description: 'Native landscaping creates habitat while providing stunning views'
          },
          {
            title: 'Pier 6 Salt Marsh',
            type: 'trivia',
            points: 35,
            challenge: {
              question: 'Why are salt marshes important urban ecosystems?',
              options: ['Water filtration', 'Storm protection', 'Wildlife habitat', 'All of the above'],
              correctAnswer: 'All of the above'
            },
            description: 'This restored salt marsh demonstrates urban ecosystem restoration'
          }
        ]
      }
    ]
  },
  'sustainable-shopping': {
    title: 'Sustainable Shopping Quest',
    description: 'Find eco-friendly businesses and learn about sustainable consumption',
    templates: [
      {
        name: 'Green Business District',
        location: { lat: 40.7505, lng: -73.9934 },
        radius: 2,
        stops: [
          {
            title: 'Local Farmers Market',
            type: 'task',
            points: 60,
            challenge: {
              taskDescription: 'Find 3 vendors selling locally grown produce. Ask about their farming practices and pesticide use.'
            },
            description: 'Support local agriculture and reduce food miles'
          },
          {
            title: 'Zero Waste Store',
            type: 'photo',
            points: 45,
            challenge: {
              photoPrompt: 'Take a photo of bulk bins or refillable containers with their eco-friendly signage'
            },
            description: 'Discover package-free shopping options'
          },
          {
            title: 'Thrift Shop Challenge',
            type: 'trivia',
            points: 30,
            challenge: {
              question: 'How much water does it take to produce one new cotton t-shirt?',
              options: ['100 gallons', '700 gallons', '2,700 gallons', '5,000 gallons'],
              correctAnswer: '2,700 gallons'
            },
            description: 'Learn about the environmental impact of fast fashion'
          }
        ]
      }
    ]
  },
  'pollinator-hunt': {
    title: 'Pollinator Paradise Hunt',
    description: 'Discover and document pollinators and their favorite plants',
    templates: [
      {
        name: 'Community Garden Safari',
        location: { lat: 40.7614, lng: -73.9776 },
        radius: 1,
        stops: [
          {
            title: 'Native Plant Section',
            type: 'photo',
            points: 55,
            challenge: {
              photoPrompt: 'Photograph a bee, butterfly, or other pollinator visiting a native flower'
            },
            description: 'Native plants support local pollinator populations'
          },
          {
            title: 'Pollinator Hotel',
            type: 'task',
            points: 40,
            challenge: {
              taskDescription: 'Find or create a pollinator habitat. Document what makes it attractive to pollinators.'
            },
            description: 'Small spaces can make big differences for urban pollinators'
          },
          {
            title: 'Flower Power Quiz',
            type: 'trivia',
            points: 25,
            challenge: {
              question: 'Which flower shape is most attractive to butterflies?',
              options: ['Flat-topped clusters', 'Deep tubes', 'Bell-shaped', 'Tiny clusters'],
              correctAnswer: 'Flat-topped clusters'
            },
            description: 'Learn how flower shapes have co-evolved with their pollinators'
          }
        ]
      }
    ]
  },
  'zero-waste-picnic': {
    title: 'Zero Waste Picnic Challenge',
    description: 'Plan and execute a completely waste-free outdoor meal',
    templates: [
      {
        name: 'Park Picnic Prep',
        location: { lat: 40.7794, lng: -73.9632 },
        radius: 2,
        stops: [
          {
            title: 'Bulk Food Store',
            type: 'task',
            points: 50,
            challenge: {
              taskDescription: 'Purchase picnic snacks using only reusable containers. Calculate packaging saved.'
            },
            description: 'Avoid single-use packaging by shopping in bulk'
          },
          {
            title: 'Picnic Setup',
            type: 'photo',
            points: 60,
            challenge: {
              photoPrompt: 'Show your complete zero-waste picnic setup with reusable plates, cups, and utensils'
            },
            description: 'Demonstrate that outdoor dining can be package-free'
          },
          {
            title: 'Waste Audit',
            type: 'trivia',
            points: 35,
            challenge: {
              question: 'What percentage of park litter typically comes from food packaging?',
              options: ['25%', '45%', '65%', '85%'],
              correctAnswer: '65%'
            },
            description: 'Understanding waste sources helps prevent pollution'
          }
        ]
      }
    ]
  }
};

export function getAdventureByLocation(theme: string, userLat: number, userLng: number) {
  const themeData = ADVENTURE_TEMPLATES[theme as keyof typeof ADVENTURE_TEMPLATES];
  if (!themeData) return null;

  // Find the closest adventure template
  let closestTemplate = themeData.templates[0];
  let minDistance = calculateDistance(userLat, userLng, closestTemplate.location.lat, closestTemplate.location.lng);

  for (const template of themeData.templates) {
    const distance = calculateDistance(userLat, userLng, template.location.lat, template.location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestTemplate = template;
    }
  }

  // Generate stops with realistic locations around the template center
  const generatedStops = closestTemplate.stops.map((stop, index) => {
    const angle = (index / closestTemplate.stops.length) * 2 * Math.PI;
    const distance = 0.002 + Math.random() * 0.003; // 200-500 meters roughly
    
    const lat = closestTemplate.location.lat + distance * Math.cos(angle);
    const lng = closestTemplate.location.lng + distance * Math.sin(angle);

    return {
      id: `stop_${Date.now()}_${index}`,
      title: stop.title,
      description: stop.description,
      location: { lat, lng },
      address: `${closestTemplate.name} Area`,
      type: stop.type,
      challenge: stop.challenge,
      completed: false,
      points: stop.points
    };
  });

  return {
    title: `${themeData.title}: ${closestTemplate.name}`,
    description: themeData.description,
    location: closestTemplate.location,
    stops: generatedStops,
    theme
  };
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}