export interface ChatAction {
  label: string;
  type: 'button' | 'link';
  payload: string; // Par exemple, un ID de devis, une URL, ou une commande spéciale
}

export interface ChatFilter {
  label: string;
  value: string;
  type: 'date' | 'status' | 'amount' | 'client';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: ChatAction[];
  suggestions?: string[]; // Suggestions de commandes basées sur le contexte
  filters?: ChatFilter[]; // Filtres disponibles pour la recherche
  isTyping?: boolean; // Pour l'indicateur de frappe du bot
} 