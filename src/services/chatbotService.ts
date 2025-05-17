import { QuoteRequest } from './quoteRequestService';
import { ChatAction } from '../types/chatbot';
import { getGeminiResponse } from './geminiService';

interface BotResponse {
  text: string;
  actions?: ChatAction[];
  suggestions?: string[];
  filters?: {
    label: string;
    value: string;
    type: 'date' | 'status' | 'amount' | 'client';
  }[];
}

// Fonction pour formater les montants
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Fonction pour calculer les statistiques avancées
const calculateAdvancedStats = (quotes: QuoteRequest[]) => {
  const stats = {
    totalAmount: 0,
    averageAmount: 0,
    highestAmount: 0,
    lowestAmount: Infinity,
    statusDistribution: {} as Record<string, number>,
    monthlyDistribution: {} as Record<string, number>,
    topClients: [] as { name: string; count: number; totalAmount: number }[],
  };

  quotes.forEach(quote => {
    const amount = quote.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;
    stats.totalAmount += amount;
    stats.highestAmount = Math.max(stats.highestAmount, amount);
    stats.lowestAmount = Math.min(stats.lowestAmount, amount);

    // Distribution par statut
    stats.statusDistribution[quote.status] = (stats.statusDistribution[quote.status] || 0) + 1;

    // Distribution mensuelle
    const month = new Date(quote.created_at || '').toLocaleString('fr-FR', { month: 'long' });
    stats.monthlyDistribution[month] = (stats.monthlyDistribution[month] || 0) + 1;

    // Top clients
    const clientName = `${quote.first_name} ${quote.last_name}`;
    const existingClient = stats.topClients.find(c => c.name === clientName);
    if (existingClient) {
      existingClient.count++;
      existingClient.totalAmount += amount;
    } else {
      stats.topClients.push({ name: clientName, count: 1, totalAmount: amount });
    }
  });

  stats.averageAmount = stats.totalAmount / quotes.length;
  stats.topClients.sort((a, b) => b.totalAmount - a.totalAmount);

  return stats;
};

// Fonction pour générer des suggestions de commandes basées sur le contexte
const generateSuggestions = (allQuoteRequests: QuoteRequest[]): string[] => {
  const suggestions: string[] = [];
  const now = new Date();
  
  // Suggestions basées sur les devis en attente
  const pendingQuotes = allQuoteRequests.filter(q => q.status === 'pending');
  if (pendingQuotes.length > 0) {
    suggestions.push(`Combien de devis en attente ?`);
    if (pendingQuotes.length <= 3) {
      pendingQuotes.forEach(q => {
        suggestions.push(`Détails du devis ${q.id?.substring(0,8)}`);
      });
    }
  }

  // Suggestions basées sur les devis à venir
  const upcomingQuotes = allQuoteRequests
    .filter(q => new Date(q.event_date) > now)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
  if (upcomingQuotes.length > 0) {
    suggestions.push('Devis à venir');
    if (upcomingQuotes.length <= 3) {
      upcomingQuotes.forEach(q => {
        suggestions.push(`Statut du devis ${q.id?.substring(0,8)}`);
      });
    }
  }

  // Suggestions basées sur les statistiques
  const totalQuotes = allQuoteRequests.length;
  if (totalQuotes > 0) {
    suggestions.push('Statistiques des devis');
    suggestions.push('Statistiques avancées');
  }

  // Suggestions basées sur les clients récents
  const recentClients = [...new Set(allQuoteRequests
    .slice(0, 5)
    .map(q => `${q.first_name} ${q.last_name}`))];
  
  if (recentClients.length > 0) {
    recentClients.forEach(client => {
      suggestions.push(`Rechercher devis ${client.split(' ')[0]}`);
    });
  }

  // Suggestions basées sur les dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  suggestions.push(`Devis pour ${today.toLocaleDateString('fr-FR')}`);
  suggestions.push(`Devis pour ${tomorrow.toLocaleDateString('fr-FR')}`);

  return suggestions;
};

// Fonction pour obtenir une réponse simple basée sur des mots-clés
export const processMessage = async (message: string, allQuoteRequests: QuoteRequest[]): Promise<BotResponse> => {
  const lowerCaseMessage = message.toLowerCase().trim();

  // Calculer les statistiques actuelles
  const currentStats = {
    total: allQuoteRequests.length,
    pending: allQuoteRequests.filter(q => q.status === 'pending').length,
    approved: allQuoteRequests.filter(q => q.status === 'approved').length,
    rejected: allQuoteRequests.filter(q => q.status === 'rejected').length
  };

  // Obtenir la réponse de Gemini
  const geminiResponse = await getGeminiResponse(message, {
    quoteRequests: allQuoteRequests,
    currentStats,
    recentActions: [] // À implémenter : garder une trace des actions récentes
  });

  // Si Gemini a fourni une réponse valide, l'utiliser
  if (geminiResponse && geminiResponse.text) {
    return {
      text: geminiResponse.text,
      actions: geminiResponse.actions,
      suggestions: geminiResponse.suggestions,
      filters: geminiResponse.filters
    };
  }

  // Fallback sur le traitement local si Gemini échoue
  const suggestions = generateSuggestions(allQuoteRequests);

  // Commandes de base
  if (lowerCaseMessage === 'aide' || lowerCaseMessage === 'commandes') {
    return {
      text: `Je peux vous aider à gérer vos devis. Voici les commandes disponibles :

📊 Statistiques :
- "Combien de devis en attente ?"
- "Nombre total de devis"
- "Statistiques des devis"
- "Statistiques avancées"
- "Devis du mois"

🔍 Recherche :
- "Liste les devis en attente"
- "Détails du devis [ID]" (ex: "Détails du devis abc123ef")
- "Quel est le statut du devis [ID] ?"
- "Rechercher devis [nom client]"
- "Devis pour [date]"
- "Filtrer devis [critère]"

📅 Planning :
- "Devis à venir"
- "Devis de la semaine"
- "Devis du mois"

💼 Actions :
- "Marquer devis [ID] comme approuvé"
- "Marquer devis [ID] comme en attente"
- "Marquer devis [ID] comme refusé"

❓ Autres :
- "Aide" pour voir cette liste
- "Bonjour" pour un message de bienvenue

Voici quelques suggestions basées sur vos données actuelles :`,
      suggestions: suggestions.slice(0, 5)
    };
  }

  // Statistiques avancées
  if (lowerCaseMessage.includes('statistiques avancées')) {
    const stats = calculateAdvancedStats(allQuoteRequests);
    const topClients = stats.topClients.slice(0, 3).map(c => 
      `${c.name}: ${c.count} devis, ${formatAmount(c.totalAmount)}`
    ).join('\n');

    return {
      text: `📊 Statistiques avancées :

💰 Montants :
• Total : ${formatAmount(stats.totalAmount)}
• Moyenne : ${formatAmount(stats.averageAmount)}
• Plus élevé : ${formatAmount(stats.highestAmount)}
• Plus bas : ${formatAmount(stats.lowestAmount)}

📈 Distribution par statut :
${Object.entries(stats.statusDistribution)
  .map(([status, count]) => `• ${status}: ${count} devis`)
  .join('\n')}

📅 Distribution mensuelle :
${Object.entries(stats.monthlyDistribution)
  .map(([month, count]) => `• ${month}: ${count} devis`)
  .join('\n')}

👥 Top clients :
${topClients}`,
      suggestions: [
        'Statistiques des devis',
        'Devis du mois',
        'Devis à venir'
      ]
    };
  }

  // Filtrage avancé
  if (lowerCaseMessage.startsWith('filtrer devis')) {
    const filterType = lowerCaseMessage.replace('filtrer devis', '').trim();
    let filteredQuotes: QuoteRequest[] = [];
    let filterLabel = '';

    if (filterType.includes('montant')) {
      const amount = parseFloat(filterType.match(/\d+/)?.[0] || '0');
      filteredQuotes = allQuoteRequests.filter(q => {
        const quoteAmount = q.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;
        return quoteAmount >= amount;
      });
      filterLabel = `Montant ≥ ${formatAmount(amount)}`;
    } else if (filterType.includes('client')) {
      const clientName = filterType.replace('client', '').trim();
      filteredQuotes = allQuoteRequests.filter(q => 
        q.first_name?.toLowerCase().includes(clientName.toLowerCase()) ||
        q.last_name?.toLowerCase().includes(clientName.toLowerCase())
      );
      filterLabel = `Client: ${clientName}`;
    } else if (filterType.includes('date')) {
      const dateStr = filterType.replace('date', '').trim();
      const targetDate = new Date(dateStr);
      filteredQuotes = allQuoteRequests.filter(q => 
        new Date(q.event_date).toDateString() === targetDate.toDateString()
      );
      filterLabel = `Date: ${targetDate.toLocaleDateString('fr-FR')}`;
    }

    if (filteredQuotes.length === 0) {
      return {
        text: `Aucun devis ne correspond au filtre "${filterLabel}".`,
        suggestions: ['Statistiques des devis', 'Devis en attente']
      };
    }

    const quoteListText = filteredQuotes
      .slice(0, 5)
      .map(q => {
        const amount = q.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;
        return `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Montant: ${formatAmount(amount)}`;
      })
      .join('\n');
    const moreQuotes = filteredQuotes.length > 5 ? `\nEt ${filteredQuotes.length - 5} autre(s)...` : '';

    return {
      text: `Résultats pour le filtre "${filterLabel}" (${filteredQuotes.length} trouvé(s)) :\n${quoteListText}${moreQuotes}`,
      actions: filteredQuotes.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      })),
      suggestions: [
        'Statistiques avancées',
        'Devis en attente',
        'Devis à venir'
      ],
      filters: [
        { label: 'Montant', value: 'montant', type: 'amount' },
        { label: 'Client', value: 'client', type: 'client' },
        { label: 'Date', value: 'date', type: 'date' }
      ]
    };
  }

  // Statistiques
  if (lowerCaseMessage.includes('statistiques des devis')) {
    const total = allQuoteRequests.length;
    const pending = allQuoteRequests.filter(q => q.status === 'pending').length;
    const approved = allQuoteRequests.filter(q => q.status === 'approved').length;
    const rejected = allQuoteRequests.filter(q => q.status === 'rejected').length;
    const thisMonth = allQuoteRequests.filter(q => {
      const quoteDate = new Date(q.created_at);
      const now = new Date();
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      text: `📊 Statistiques des devis :
• Total : ${total} devis
• En attente : ${pending} devis
• Approuvés : ${approved} devis
• Refusés : ${rejected} devis
• Ce mois-ci : ${thisMonth} devis`,
      actions: [
        { label: "Voir les devis en attente", type: "button", payload: "view_pending" },
        { label: "Voir les devis du mois", type: "button", payload: "view_month" }
      ]
    };
  }

  if (lowerCaseMessage.includes('devis du mois')) {
    const thisMonth = allQuoteRequests.filter(q => {
      const quoteDate = new Date(q.created_at);
      const now = new Date();
      return quoteDate.getMonth() === now.getMonth() && quoteDate.getFullYear() === now.getFullYear();
    });

    if (thisMonth.length === 0) {
      return { text: "Aucun devis n'a été créé ce mois-ci." };
    }

    const monthName = new Date().toLocaleString('fr-FR', { month: 'long' });
    const quoteListText = thisMonth
      .slice(0, 5)
      .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Statut: ${q.status}`)
      .join('\n');
    const moreQuotes = thisMonth.length > 5 ? `\nEt ${thisMonth.length - 5} autre(s)...` : '';

    return {
      text: `Devis de ${monthName} (${thisMonth.length} au total) :\n${quoteListText}${moreQuotes}`,
      actions: thisMonth.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      }))
    };
  }

  // Recherche
  if (lowerCaseMessage.startsWith('rechercher devis')) {
    const searchTerm = lowerCaseMessage.replace('rechercher devis', '').trim();
    const matchingQuotes = allQuoteRequests.filter(q => 
      q.first_name?.toLowerCase().includes(searchTerm) ||
      q.last_name?.toLowerCase().includes(searchTerm) ||
      q.company?.toLowerCase().includes(searchTerm)
    );

    if (matchingQuotes.length === 0) {
      return { text: `Aucun devis trouvé pour "${searchTerm}".` };
    }

    const quoteListText = matchingQuotes
      .slice(0, 5)
      .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Statut: ${q.status}`)
      .join('\n');
    const moreQuotes = matchingQuotes.length > 5 ? `\nEt ${matchingQuotes.length - 5} autre(s)...` : '';

    return {
      text: `Résultats pour "${searchTerm}" (${matchingQuotes.length} trouvé(s)) :\n${quoteListText}${moreQuotes}`,
      actions: matchingQuotes.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      }))
    };
  }

  if (lowerCaseMessage.startsWith('devis pour')) {
    const dateStr = lowerCaseMessage.replace('devis pour', '').trim();
    let targetDate: Date;
    
    try {
      // Essayer de parser la date
      targetDate = new Date(dateStr);
      if (isNaN(targetDate.getTime())) {
        return { text: "Format de date invalide. Essayez 'JJ/MM/AAAA' ou 'JJ-MM-AAAA'." };
      }
    } catch {
      return { text: "Format de date invalide. Essayez 'JJ/MM/AAAA' ou 'JJ-MM-AAAA'." };
    }

    const matchingQuotes = allQuoteRequests.filter(q => {
      const quoteDate = new Date(q.event_date);
      return quoteDate.toDateString() === targetDate.toDateString();
    });

    if (matchingQuotes.length === 0) {
      return { text: `Aucun devis trouvé pour le ${targetDate.toLocaleDateString('fr-FR')}.` };
    }

    const quoteListText = matchingQuotes
      .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Statut: ${q.status}`)
      .join('\n');

    return {
      text: `Devis pour le ${targetDate.toLocaleDateString('fr-FR')} (${matchingQuotes.length} trouvé(s)) :\n${quoteListText}`,
      actions: matchingQuotes.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      }))
    };
  }

  // Planning
  if (lowerCaseMessage.includes('devis à venir')) {
    const now = new Date();
    const upcomingQuotes = allQuoteRequests
      .filter(q => new Date(q.event_date) > now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    if (upcomingQuotes.length === 0) {
      return { text: "Aucun devis à venir." };
    }

    const quoteListText = upcomingQuotes
      .slice(0, 5)
      .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Date: ${new Date(q.event_date).toLocaleDateString('fr-FR')}`)
      .join('\n');
    const moreQuotes = upcomingQuotes.length > 5 ? `\nEt ${upcomingQuotes.length - 5} autre(s)...` : '';

    return {
      text: `Devis à venir (${upcomingQuotes.length} au total) :\n${quoteListText}${moreQuotes}`,
      actions: upcomingQuotes.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      }))
    };
  }

  if (lowerCaseMessage.includes('devis de la semaine')) {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const weekQuotes = allQuoteRequests
      .filter(q => {
        const quoteDate = new Date(q.event_date);
        return quoteDate >= now && quoteDate <= endOfWeek;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    if (weekQuotes.length === 0) {
      return { text: "Aucun devis prévu pour cette semaine." };
    }

    const quoteListText = weekQuotes
      .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Date: ${new Date(q.event_date).toLocaleDateString('fr-FR')}`)
      .join('\n');

    return {
      text: `Devis de la semaine (${weekQuotes.length} au total) :\n${quoteListText}`,
      actions: weekQuotes.slice(0,3).map(q => ({
        label: `Voir devis ${q.id?.substring(0,8)}`,
        type: 'button',
        payload: `view_quote_${q.id}`
      }))
    };
  }

  // Actions
  if (lowerCaseMessage.startsWith('marquer devis')) {
    const parts = lowerCaseMessage.split(' ');
    const quoteIdPart = parts[2];
    const newStatus = parts[parts.length - 1];

    if (!['approuvé', 'en attente', 'refusé'].includes(newStatus)) {
      return { text: "Statut invalide. Utilisez 'approuvé', 'en attente' ou 'refusé'." };
    }

    const targetQuote = allQuoteRequests.find(q => q.id?.toLowerCase().startsWith(quoteIdPart.toLowerCase()));
    if (!targetQuote) {
      return { text: `Devis ${quoteIdPart} non trouvé.` };
    }

    const statusMap = {
      'approuvé': 'approved',
      'en attente': 'pending',
      'refusé': 'rejected'
    };

    return {
      text: `Voulez-vous marquer le devis ${targetQuote.id?.substring(0,8)} comme ${newStatus} ?`,
      actions: [
        {
          label: `Confirmer ${newStatus}`,
          type: 'button',
          payload: `update_status_${targetQuote.id}_${statusMap[newStatus as keyof typeof statusMap]}`
        }
      ]
    };
  }

  // Commandes existantes
  if (lowerCaseMessage.includes('devis en attente') || lowerCaseMessage.includes('devis à traiter')) {
    const pendingQuotes = allQuoteRequests.filter(q => q.status === 'pending');
    if (pendingQuotes.length > 0) {
      const quoteListText = pendingQuotes
        .slice(0, 5)
        .map(q => `ID: ${q.id?.substring(0,8)}, Client: ${q.first_name} ${q.last_name}, Date: ${new Date(q.event_date).toLocaleDateString('fr-FR')}`)
        .join('\n');
      const morePending = pendingQuotes.length > 5 ? `\nEt ${pendingQuotes.length - 5} autre(s)...` : '';
      return { 
        text: `Il y a ${pendingQuotes.length} devis en attente.\nVoici les plus récents :\n${quoteListText}${morePending}`,
        actions: pendingQuotes.slice(0,3).map(q => ({
          label: `Voir devis ${q.id?.substring(0,8)}`,
          type: 'button',
          payload: `view_quote_${q.id}`
        }))
      };
    }
    return { text: "Il n'y a aucun devis en attente pour le moment." };
  }

  if (lowerCaseMessage.startsWith('détails du devis') || lowerCaseMessage.startsWith('detail devis') || lowerCaseMessage.startsWith('details devis')) {
    const parts = lowerCaseMessage.split(' ');
    const quoteIdPart = parts[parts.length - 1];
    
    const targetQuote = allQuoteRequests.find(q => q.id?.toLowerCase().startsWith(quoteIdPart.toLowerCase()));

    if (targetQuote && targetQuote.id) {
      const totalAmount = targetQuote.items?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toFixed(2) || 'N/A';
      return {
        text: `Détails pour le devis ${targetQuote.id?.substring(0,8)}:
Client: ${targetQuote.first_name} ${targetQuote.last_name} (${targetQuote.company || 'Particulier'})
Email: ${targetQuote.email}
Statut: ${targetQuote.status}
Date événement: ${new Date(targetQuote.event_date).toLocaleDateString('fr-FR')}
Montant (est.): ${totalAmount}€
Articles: ${targetQuote.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || 'Aucun'}`,
        actions: [
          { label: "Ouvrir les détails complets", type: "button", payload: `view_quote_${targetQuote.id}` },
          { label: `Marquer comme ${targetQuote.status === 'pending' ? 'approuvé' : 'en attente'}`, type: "button", payload: `update_status_${targetQuote.id}_${targetQuote.status === 'pending' ? 'approved' : 'pending'}` }
        ]
      };
    }
    return { text: `Je n'ai pas trouvé de devis avec l'ID commençant par "${quoteIdPart}". Veuillez vérifier l'ID.` };
  }
  
  if (lowerCaseMessage.startsWith('quel est le statut du devis')) {
    const parts = lowerCaseMessage.split(' ');
    const quoteIdPart = parts[parts.length - 1];
    const targetQuote = allQuoteRequests.find(q => q.id?.toLowerCase().startsWith(quoteIdPart.toLowerCase()));
    if (targetQuote) {
      return { text: `Le statut du devis ${targetQuote.id?.substring(0,8)} est : ${targetQuote.status}.`};
    }
    return { text: `Devis ${quoteIdPart} non trouvé.`};
  }

  if (lowerCaseMessage.includes('nombre total de devis') || lowerCaseMessage.includes('combien de devis')) {
    return { text: `Il y a actuellement ${allQuoteRequests.length} devis enregistrés au total.` };
  }

  if (lowerCaseMessage.includes('bonjour') || lowerCaseMessage.includes('salut') || lowerCaseMessage.includes('hello')) {
    return { 
      text: "Bonjour ! Comment puis-je vous aider avec la gestion des devis aujourd'hui ? Tapez 'aide' pour voir la liste des commandes disponibles.",
      suggestions: suggestions.slice(0, 3)
    };
  }

  if (lowerCaseMessage.includes('merci')) {
    return { 
      text: "De rien ! N'hésitez pas si vous avez d'autres questions.",
      suggestions: suggestions.slice(0, 3)
    };
  }

  return { 
    text: "Désolé, je n'ai pas bien compris votre demande. Tapez 'aide' pour voir la liste des commandes que je comprends.",
    suggestions: suggestions.slice(0, 3)
  };
}; 