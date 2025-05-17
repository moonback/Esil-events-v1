export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'product' | 'moodboard' | 'checklist';
  metadata?: {
    productId?: string;
    moodboardId?: string;
    checklistId?: string;
    quickReplies?: string[];
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  context: {
    eventType?: string;
    budget?: number;
    date?: Date;
    location?: string;
    guestCount?: number;
  };
}

export interface BotResponse {
  message: string;
  type: 'text' | 'product' | 'moodboard' | 'checklist';
  metadata?: {
    productId?: string;
    moodboardId?: string;
    checklistId?: string;
  };
  quickReplies?: string[];
}

export interface ChatbotProps {
  onClose?: () => void;
  initialMessage?: string;
}

export interface MessageMetadata {
  productId?: string;
  moodboardId?: string;
  checklistId?: string;
  quickReplies?: string[];
  eventType?: string;
} 