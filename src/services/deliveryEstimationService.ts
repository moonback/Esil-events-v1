import { callGeminiAPI } from './geminiService';
import { CartItem } from '../context/CartContext';

interface DeliveryEstimationRequest {
  items: CartItem[];
  deliveryType: 'eco' | 'premium';
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  exteriorAccess: string;
  interiorAccess: string;
  elevatorWidth?: string | number;
  elevatorHeight?: string | number;
  elevatorDepth?: string | number;
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
}

interface DeliveryEstimation {
  deliveryCost: number;
  installationCost: number;
  requiredPersonnel: {
    delivery: number;
    installation: number;
  };
  estimatedDuration: {
    delivery: string;
    installation: string;
  };
  notes: string[];
}

// Base location coordinates (Mantes-la-Jolie)
const BASE_LOCATION = {
  postalCode: '78711',
  city: 'Mantes-la-Jolie',
  coordinates: {
    lat: 48.9907,
    lng: 1.7167
  }
};

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to get coordinates from postal code (simplified version)
async function getCoordinatesFromPostalCode(postalCode: string): Promise<{ lat: number; lng: number }> {
  // In a real application, you would use a geocoding service like Google Maps API
  // For now, we'll use a simplified version that returns coordinates for some common postal codes
  const commonLocations: { [key: string]: { lat: number; lng: number } } = {
    '75001': { lat: 48.8566, lng: 2.3522 }, // Paris
    '69001': { lat: 45.7640, lng: 4.8357 }, // Lyon
    '13001': { lat: 43.2965, lng: 5.3698 }, // Marseille
    '33000': { lat: 44.8378, lng: -0.5792 }, // Bordeaux
    '59000': { lat: 50.6292, lng: 3.0573 }, // Lille
    '67000': { lat: 48.5734, lng: 7.7521 }, // Strasbourg
    '44000': { lat: 47.2184, lng: -1.5536 }, // Nantes
    '35000': { lat: 48.1173, lng: -1.6778 }, // Rennes
    '06000': { lat: 43.7102, lng: 7.2620 }, // Nice
    '31000': { lat: 43.6047, lng: 1.4442 }, // Toulouse
  };

  // If we don't have the coordinates, return a default location
  return commonLocations[postalCode] || { lat: 48.8566, lng: 2.3522 }; // Default to Paris
}

const SYSTEM_PROMPT = `Vous êtes un expert en estimation des coûts de livraison et d'installation de matériel événementiel. Votre tâche est d'analyser la demande de livraison et de fournir des estimations précises des coûts et des besoins en personnel.

Prenez en compte les facteurs suivants :
1. Volume total et poids des articles
2. Distance de livraison et localisation (uniquement dans un rayon de 200km autour de Mantes-la-Jolie, 78711)
3. Conditions d'accès (ascenseur, escaliers, etc.)
4. Heure de la journée et date
5. Type de livraison (éco vs premium)
6. Complexité de l'installation basée sur les articles

Important : Si le lieu de livraison est à plus de 200km de Mantes-la-Jolie (78711), renvoyez un message d'erreur indiquant que la livraison n'est pas disponible pour cette localisation.

Répondez dans le format JSON suivant :
{
  "deliveryCost": number,
  "installationCost": number,
  "requiredPersonnel": {
    "delivery": number,
    "installation": number
  },
  "estimatedDuration": {
    "delivery": string,
    "installation": string
  },
  "notes": string[]
}`;

export async function estimateDeliveryAndInstallation(request: DeliveryEstimationRequest): Promise<DeliveryEstimation> {
  try {
    // Obtenir les coordonnées du lieu de livraison
    const deliveryCoordinates = await getCoordinatesFromPostalCode(request.deliveryPostalCode);
    
    // Calculer la distance depuis Mantes-la-Jolie
    const distance = calculateDistance(
      BASE_LOCATION.coordinates.lat,
      BASE_LOCATION.coordinates.lng,
      deliveryCoordinates.lat,
      deliveryCoordinates.lng
    );

    // Vérifier si le lieu est dans le rayon de 200km
    if (distance > 200) {
      throw new Error(`La livraison n'est pas disponible pour cette adresse. Nous livrons uniquement dans un rayon de 200km autour de Mantes-la-Jolie (78711). Distance actuelle: ${Math.round(distance)}km`);
    }

    const prompt = `
${SYSTEM_PROMPT}

Veuillez analyser cette demande de livraison :

Articles :
${request.items.map(item => `- ${item.name} (${item.quantity} unités)`).join('\n')}

Détails de livraison :
- Type : ${request.deliveryType}
- Adresse : ${request.deliveryAddress}, ${request.deliveryPostalCode} ${request.deliveryCity}
- Distance depuis Mantes-la-Jolie : ${Math.round(distance)}km
- Accès extérieur : ${request.exteriorAccess}
- Accès intérieur : ${request.interiorAccess}
${request.elevatorWidth ? `- Dimensions de l'ascenseur : ${request.elevatorWidth}x${request.elevatorHeight}x${request.elevatorDepth}` : ''}

Horaires de l'événement :
- Date : ${request.eventDate}
- Début : ${request.eventStartTime}
- Fin : ${request.eventEndTime}

Veuillez fournir une estimation détaillée des coûts et des besoins en personnel.
`;

    const response = await callGeminiAPI({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    // Nettoyer la réponse en supprimant le formatage markdown
    const cleanedResponse = response
      .replace(/```json\n?/g, '') // Supprimer l'ouverture ```json
      .replace(/```\n?/g, '')     // Supprimer la fermeture ```
      .trim();                    // Supprimer les espaces supplémentaires

    // Analyser la réponse nettoyée
    const estimation = JSON.parse(cleanedResponse) as DeliveryEstimation;
    
    // Valider la structure de la réponse
    if (!estimation.deliveryCost || !estimation.installationCost || !estimation.requiredPersonnel) {
      throw new Error('Structure de réponse d\'estimation invalide');
    }

    // Ajouter les informations de distance aux notes
    estimation.notes.push(`Distance de livraison : ${Math.round(distance)}km depuis Mantes-la-Jolie`);

    return estimation;
  } catch (error) {
    console.error('Erreur lors de l\'estimation des coûts de livraison :', error);
    throw error;
  }
} 