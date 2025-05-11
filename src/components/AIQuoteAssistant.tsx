import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuoteSuggestions } from '../services/aiQuoteService';
import { useCart } from '../context/CartContext';
import { DEFAULT_PRODUCT_IMAGE } from '../constants/images';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ConversationStep {
  id: string;
  question: string;
  type: 'multiple_choice' | 'number' | 'date' | 'text' | 'budget';
  options?: string[];
  validation?: (value: any) => boolean;
}

interface ProductSuggestion {
  type: 'product' | 'package';
  id: string;
  name: string;
  reason: string;
  estimated_price_per_unit?: number;
  estimated_total_price?: number;
  items_included?: string[];
}

interface AIResponse {
  suggestions: ProductSuggestion[];
  additional_tips: string;
}

const conversationFlow: ConversationStep[] = [
  {
    id: 'event_type',
    question: 'Bonjour ! Je suis votre assistant ESIL Events. Pour quel type d\'événement avez-vous besoin de matériel ?',
    type: 'multiple_choice',
    options: ['Séminaire', 'Soirée d\'entreprise', 'Mariage', 'Anniversaire', 'Festival', 'Autre']
  },
  {
    id: 'guest_count',
    question: 'Combien d\'invités attendez-vous approximativement ?',
    type: 'number',
    validation: (value) => value > 0
  },
  {
    id: 'event_date',
    question: 'Avez-vous une date ou une période en tête pour votre événement ?',
    type: 'date'
  },
  {
    id: 'budget',
    question: 'Avez-vous une idée de votre budget pour la location de matériel ?',
    type: 'budget'
  },
  {
    id: 'style',
    question: 'Quelle ambiance ou style souhaitez-vous créer ?',
    type: 'multiple_choice',
    options: ['Chic', 'Moderne', 'Rustique', 'Festif', 'Corporate', 'Ludique']
  },
  {
    id: 'specific_needs',
    question: 'Avez-vous des besoins spécifiques en tête (sonorisation, éclairage particulier, type de jeux, mobilier spécifique) ?',
    type: 'text'
  }
];

export const AIQuoteAssistant: React.FC = () => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [additionalTips, setAdditionalTips] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setAnswers({});
    setSuggestions([]);
    setAdditionalTips('');
    // Start conversation with first question
    addBotMessage(conversationFlow[0].question);
  };

  const scrollToTop = () => {
    messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start conversation with first question
      addBotMessage(conversationFlow[0].question);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to top when new messages are added
    scrollToTop();
  }, [messages]);

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bot',
      content,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleAnswer = async (answer: any) => {
    const currentQuestion = conversationFlow[currentStep];
    addUserMessage(answer.toString());

    // Store the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Move to next question or generate suggestions
    if (currentStep < conversationFlow.length - 1) {
      setCurrentStep(prev => prev + 1);
      addBotMessage(conversationFlow[currentStep + 1].question);
    } else {
      setIsLoading(true);
      try {
        const response = await generateQuoteSuggestions(answers as any);
        setSuggestions(response.suggestions);
        setAdditionalTips(response.additional_tips);
        
        // Display suggestions
        addBotMessage('Voici mes suggestions personnalisées pour votre événement :');
        
        // Display each suggestion
        response.suggestions.forEach(suggestion => {
          const message = `${suggestion.name} - ${suggestion.reason}`;
          addBotMessage(message);
        });
        
        // Display additional tips
        if (response.additional_tips) {
          addBotMessage(`Conseil supplémentaire : ${response.additional_tips}`);
        }
        
        // Add a call to action
        addBotMessage('Souhaitez-vous que je vous aide à créer un devis avec ces suggestions ?');
      } catch (error) {
        console.error('Error generating suggestions:', error);
        addBotMessage('Désolé, je n\'ai pas pu générer des suggestions pour le moment. Veuillez réessayer plus tard ou contacter directement notre équipe.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddToCart = (suggestion: ProductSuggestion) => {
    const cartItem = {
      id: suggestion.id,
      name: suggestion.name,
      image: DEFAULT_PRODUCT_IMAGE,
      priceTTC: suggestion.type === 'product' 
        ? suggestion.estimated_price_per_unit! 
        : suggestion.estimated_total_price!,
      quantity: 1
    };

    addToCart(cartItem);
    addBotMessage(`J'ai ajouté "${suggestion.name}" à votre devis.`);
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <div className="mt-4 space-y-4 md:space-y-6">
        <div className="text-center mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">Suggestions personnalisées</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Basées sur vos besoins et préférences</p>
        </div>

        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Header with type badge */}
            <div className="px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${
                  suggestion.type === 'package' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {suggestion.type === 'package' ? 'Package' : 'Produit individuel'}
                </span>
                <span className="text-xs md:text-sm text-gray-500">
                  {suggestion.type === 'package' 
                    ? `${suggestion.items_included?.length || 0} articles inclus`
                    : 'Article unique'}
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="p-3 md:p-4">
              <div className="flex gap-3 md:gap-4">
                {/* Product image placeholder */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base md:text-lg text-gray-800 mb-1">{suggestion.name}</h4>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{suggestion.reason}</p>

                  {/* Price and action button */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mt-2">
                    <div>
                      <p className="text-base md:text-lg font-semibold text-blue-600">
                        {suggestion.type === 'product'
                          ? `${suggestion.estimated_price_per_unit}€/unité`
                          : `${suggestion.estimated_total_price}€`}
                      </p>
                      {suggestion.type === 'package' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Prix moyen par article : {Math.round(suggestion.estimated_total_price! / (suggestion.items_included?.length || 1))}€
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(suggestion)}
                      className="w-full md:w-auto px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs md:text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Ajouter au devis
                    </button>
                  </div>
                </div>
              </div>

              {/* Package details */}
              {suggestion.type === 'package' && suggestion.items_included && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                  <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Contenu du package :</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestion.items_included.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional features */}
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Disponible immédiatement
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Livraison sous 24h
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Garantie incluse
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Additional tips */}
        {additionalTips && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-sm md:text-base text-blue-800 mb-1">Conseil supplémentaire</h4>
                <p className="text-xs md:text-sm text-blue-600">{additionalTips}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInput = () => {
    const currentQuestion = conversationFlow[currentStep];

    switch (currentQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="flex flex-wrap gap-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre d'invités"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  if (currentQuestion.validation?.(Number(value))) {
                    handleAnswer(Number(value));
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const value = document.querySelector('input[type="number"]') as HTMLInputElement;
                if (currentQuestion.validation?.(Number(value.value))) {
                  handleAnswer(Number(value.value));
                }
              }}
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Valider
            </button>
          </div>
        );

      case 'date':
        return (
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        );

      case 'budget':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className="flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Budget en €"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer(Number((e.target as HTMLInputElement).value));
                }
              }}
            />
            <button
              onClick={() => {
                const value = document.querySelector('input[type="number"]') as HTMLInputElement;
                handleAnswer(Number(value.value));
              }}
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Valider
            </button>
          </div>
        );

      case 'text':
        return (
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 md:px-4 md:py-2 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Vos besoins spécifiques"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer((e.target as HTMLInputElement).value);
                }
              }}
            />
            <button
              onClick={() => {
                const value = document.querySelector('input[type="text"]') as HTMLInputElement;
                handleAnswer(value.value);
              }}
              className="px-3 py-2 md:px-4 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Envoyer
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating button to open chat */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 z-50 group"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 transform group-hover:scale-110 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative">1</span>
          </span>
        </div>
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${
              isMaximized 
                ? 'inset-4' 
                : 'bottom-24 right-6 w-[420px] md:w-[480px] lg:w-[520px]'
            } h-[600px] md:h-[700px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100`}
          >
            {/* Chat header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assistant Devis ESIL Events</h3>
                  <p className="text-sm text-white/80">En ligne</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  title="Réinitialiser la conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  {isMaximized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
              <div ref={messagesStartRef} />
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  } items-end gap-2`}
                >
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-2'
                        : 'bg-white text-gray-800 border border-gray-100 mr-2'
                    }`}
                  >
                    {/* Message content */}
                    <div className="text-sm md:text-base leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* Message timestamp */}
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {/* Decorative elements */}
                    {message.type === 'user' ? (
                      <div className="absolute -right-1 bottom-0 w-3 h-3 bg-blue-600 transform rotate-45" />
                    ) : (
                      <div className="absolute -left-1 bottom-0 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45" />
                    )}
                  </div>
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="bg-white text-gray-800 rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              {renderSuggestions()}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-3 md:p-4 bg-white border-t border-gray-100">
              {renderInput()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 