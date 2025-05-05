/**
 * Service de génération de suggestions pour le chatbot
 * Permet de générer des suggestions de questions intelligentes basées sur le contexte
 */

import { Product } from '../../types/Product';

/**
 * Génère des suggestions de questions intelligentes basées sur les produits disponibles et l'historique des conversations
 * @param products La liste des produits disponibles
 * @param messageHistory L'historique des messages
 * @returns Un tableau de suggestions de questions
 */
export const generateDynamicSuggestions = (products: Product[], messageHistory: {text: string, sender: 'user' | 'bot'}[] = []): string[] => {
  // Suggestions par défaut organisées par catégorie - Version améliorée
  const defaultSuggestions = {
    general: [
      "Quels sont vos produits les plus populaires pour un événement professionnel ?",
      "Quels équipements recommandez-vous pour un mariage en extérieur ?",
      "Comment fonctionne votre service de livraison et installation ?",
      "Proposez-vous des forfaits spéciaux pour les événements de grande envergure ?",
      "Quelles sont les nouveautés dans votre catalogue de location ?"
    ],
    pricing: [
      "Quels sont vos tarifs pour une location sur un week-end complet ?",
      "Proposez-vous des réductions pour les locations de longue durée ?",
      "Y a-t-il des frais supplémentaires pour la livraison et l'installation ?",
      "Comment fonctionne le système de caution pour vos équipements ?",
      "Avez-vous des offres promotionnelles pour les réservations anticipées ?"
    ],
    logistics: [
      "Quel est votre délai de réservation minimum pour un événement ?",
      "Comment se déroule la livraison et la récupération du matériel ?",
      "Proposez-vous un service d'assistance technique pendant l'événement ?",
      "Que se passe-t-il en cas de problème avec l'équipement pendant l'événement ?",
      "Quelle est votre zone de livraison et les délais associés ?"
    ],
    specific: [
      "Avez-vous des systèmes de sonorisation adaptés pour des conférences ?",
      "Quels types d'éclairages proposez-vous pour une ambiance festive ?",
      "Disposez-vous de mobilier pour des événements en extérieur ?",
      "Proposez-vous des solutions vidéo pour des projections en plein air ?",
      "Quelles sont les spécifications techniques de vos équipements audio ?"
    ],
    comparison: [
      "Pouvez-vous comparer les différents systèmes de sonorisation que vous proposez ?",
      "Quelle est la différence entre vos modèles d'éclairage LED et traditionnels ?",
      "Comparez les options de mobilier pour intérieur et extérieur",
      "Quelles sont les différences entre vos vidéoprojecteurs standard et haut de gamme ?",
      "Quel équipement offre le meilleur rapport qualité-prix pour un petit événement ?"
    ],
    location: [
      "Quels lieux recommandez-vous pour un événement en extérieur ?",
      "Avez-vous des partenariats avec des salles de réception ?",
      "Quels équipements sont adaptés pour un espace restreint ?",
      "Comment adapter votre matériel à différents types de lieux ?"
    ],
    experience: [
      "Pouvez-vous partager des exemples d'événements réussis avec votre matériel ?",
      "Quels retours avez-vous des clients sur vos services ?",
      "Avez-vous de l'expérience avec des événements internationaux ?",
      "Comment assurez-vous la qualité de vos prestations ?"
    ]
  };

  // Si pas de produits, retourner un mix de suggestions par défaut
  if (!products || products.length === 0) {
    return [
      ...defaultSuggestions.general.slice(0, 1),
      ...defaultSuggestions.pricing.slice(0, 1),
      ...defaultSuggestions.logistics.slice(0, 1),
      ...defaultSuggestions.specific.slice(0, 1)
    ];
  }

  // Extraire les catégories uniques des produits avec comptage de fréquence
  const categoryFrequency: Record<string, number> = {};
  products.forEach(product => {
    if (typeof product.category === 'string' && product.category.trim()) {
      categoryFrequency[product.category] = (categoryFrequency[product.category] || 0) + 1;
    } else if (Array.isArray(product.category)) {
      product.category.forEach(cat => {
        if (cat && cat.trim()) {
          categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
        }
      });
    }
  });

  // Trier les catégories par fréquence et prendre les plus populaires
  const topCategories = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Générer des suggestions basées sur les catégories les plus populaires
  const categorySuggestions = topCategories.map(category => {
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    return `Quels produits proposez-vous dans la catégorie ${formattedCategory} ?`;
  });

  // Analyser l'historique des messages pour des suggestions contextuelles
  let contextualSuggestions: string[] = [];
  let conversationContext: 'pricing' | 'logistics' | 'specific' | 'general' | 'comparison' | 'location' | 'experience' = 'general';
  
  if (messageHistory.length > 0) {
    // Extraire les derniers messages pour analyse contextuelle
    const recentMessages = messageHistory.slice(-5);
    const lastUserMessage = [...recentMessages].reverse().find(msg => msg.sender === 'user');
    const lastBotMessage = [...recentMessages].reverse().find(msg => msg.sender === 'bot');
    
    // Détecter le contexte de la conversation avec des mots-clés enrichis
    const pricingKeywords = ['prix', 'tarif', 'coût', 'budget', '€', 'euro', 'euros', 'réduction', 'promotion', 'remise', 'économie', 'devis', 'facture', 'paiement', 'acompte'];
    const logisticsKeywords = ['livraison', 'transport', 'installation', 'délai', 'disponibilité', 'réservation', 'date', 'planning', 'calendrier', 'horaire', 'retour', 'récupération', 'montage', 'démontage'];
    const specificProductKeywords = ['modèle', 'référence', 'caractéristique', 'technique', 'puissance', 'dimension', 'taille', 'poids', 'capacité', 'autonomie', 'batterie', 'câble', 'connectique', 'compatible'];
    const comparisonKeywords = ['comparer', 'comparaison', 'versus', 'vs', 'différence', 'meilleur', 'comparatif', 'tableau', 'alternative', 'équivalent', 'similaire', 'supérieur', 'inférieur', 'avantage', 'inconvénient'];
    const locationKeywords = ['lieu', 'salle', 'espace', 'extérieur', 'intérieur', 'plein air', 'adresse', 'site', 'terrain', 'jardin', 'château', 'hôtel', 'restaurant'];
    const experienceKeywords = ['expérience', 'avis', 'témoignage', 'client', 'satisfaction', 'qualité', 'service', 'prestation', 'professionnel', 'expertise', 'conseil', 'recommandation'];
    
    // Analyser les messages récents pour déterminer le contexte avec une logique améliorée
    const allText = recentMessages.map(msg => msg.text.toLowerCase()).join(' ');
    
    // Compter les occurrences de mots-clés par catégorie pour une détection plus précise
    const contextScores = {
      comparison: comparisonKeywords.filter(keyword => allText.includes(keyword)).length,
      pricing: pricingKeywords.filter(keyword => allText.includes(keyword)).length,
      logistics: logisticsKeywords.filter(keyword => allText.includes(keyword)).length,
      specific: specificProductKeywords.filter(keyword => allText.includes(keyword)).length,
      location: locationKeywords.filter(keyword => allText.includes(keyword)).length,
      experience: experienceKeywords.filter(keyword => allText.includes(keyword)).length
    };
    
    // Déterminer le contexte dominant
    const maxScore = Math.max(...Object.values(contextScores));
    
    if (maxScore > 0) {
      // Trouver la catégorie avec le score le plus élevé
      const dominantContext = Object.entries(contextScores)
        .find(([_, score]) => score === maxScore)?.[0] as typeof conversationContext;
      
      if (dominantContext) {
        conversationContext = dominantContext;
      }
    } else {
      // Si aucun mot-clé n'est détecté, rester sur le contexte général
      conversationContext = 'general';
    }
    
    // Générer des suggestions basées sur le dernier message du bot
    if (lastBotMessage) {
      // Si le dernier message du bot mentionne un produit, suggérer des questions de suivi
      const mentionedProducts = products.filter(product => 
        lastBotMessage.text.toLowerCase().includes(product.name.toLowerCase())
      );
      
      if (mentionedProducts.length > 0) {
        const product = mentionedProducts[0];
        
        // Suggestions personnalisées enrichies basées sur le produit mentionné
        contextualSuggestions = [
          `Quel est le prix de location de ${product.name} pour un week-end complet ?`,
          `Quelles sont les spécifications techniques détaillées de ${product.name} ?`,
          `Avez-vous des accessoires complémentaires recommandés avec ${product.name} ?`,
          `Quelle est la disponibilité actuelle de ${product.name} pour les prochains mois ?`,
          `Pouvez-vous me montrer des exemples d'utilisation de ${product.name} lors d'événements précédents ?`
        ];
        
        // Limiter à 3 suggestions aléatoires pour plus de variété
        contextualSuggestions = contextualSuggestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Ajouter une suggestion basée sur la catégorie du produit si disponible
        if (product.category) {
          const category = Array.isArray(product.category) ? product.category[0] : product.category;
          if (category) {
            contextualSuggestions.push(`Quels autres produits de la catégorie ${category} pourriez-vous me recommander ?`);
          }
        }
        
        // Si plusieurs produits sont mentionnés, suggérer une comparaison
        if (mentionedProducts.length > 1) {
          const product2 = mentionedProducts[1];
          contextualSuggestions.push(`Pouvez-vous comparer ${product.name} et ${product2.name} ?`);
        }
      }
      
      // Suggestions basées sur des mots-clés spécifiques dans la conversation
      if (lastBotMessage.text.toLowerCase().includes('disponible') || lastBotMessage.text.toLowerCase().includes('stock')) {
        contextualSuggestions.push("Quel est votre délai de réservation minimum pour garantir la disponibilité ?");
      }
      
      if (lastBotMessage.text.toLowerCase().includes('événement') || lastBotMessage.text.toLowerCase().includes('occasion')) {
        contextualSuggestions.push("Proposez-vous des services de conseil pour optimiser le choix d'équipements selon le type d'événement ?");
      }
    }
    
    // Si l'utilisateur a posé une question sur un sujet spécifique, proposer des questions de suivi
    if (lastUserMessage) {
      const userText = lastUserMessage.text.toLowerCase();
      
      if (userText.includes('mariage')) {
        contextualSuggestions.push("Quels packages recommandez-vous spécifiquement pour un mariage ?");
      } else if (userText.includes('conférence') || userText.includes('séminaire')) {
        contextualSuggestions.push("Quels équipements audio-visuels sont essentiels pour une conférence professionnelle ?");
      } else if (userText.includes('festival') || userText.includes('concert')) {
        contextualSuggestions.push("Quels systèmes de sonorisation recommandez-vous pour un événement musical en extérieur ?");
      }
    }
  }

  // Sélectionner des suggestions par défaut basées sur le contexte détecté
  const contextBasedDefaultSuggestions = defaultSuggestions[conversationContext].slice(0, 2);

  // Générer des suggestions basées sur les produits populaires (limité à 2)
  const productSuggestions = products
    .slice(0, 5)
    .map(product => `Pouvez-vous me donner plus d'informations sur ${product.name} et ses applications ?`)
    .slice(0, 2);

  // Combiner et filtrer les suggestions pour éviter les doublons
  // Priorité: suggestions contextuelles > catégories > produits > suggestions par défaut
  const allSuggestions = [
    ...contextualSuggestions,
    ...categorySuggestions,
    ...productSuggestions,
    ...contextBasedDefaultSuggestions
  ];
  
  // Éliminer les doublons et les suggestions trop similaires
  const uniqueSuggestions: string[] = [];
  const lowercaseSuggestions = new Set<string>();
  
  for (const suggestion of allSuggestions) {
    const normalized = suggestion.toLowerCase();
    // Vérifier si une suggestion similaire existe déjà
    const isDuplicate = Array.from(lowercaseSuggestions).some(existing => 
      normalized.includes(existing) || existing.includes(normalized)
    );
    
    if (!isDuplicate) {
      uniqueSuggestions.push(suggestion);
      lowercaseSuggestions.add(normalized);
      
      // Limiter à 4 suggestions
      if (uniqueSuggestions.length >= 4) break;
    }
  }
  
  return uniqueSuggestions;
};