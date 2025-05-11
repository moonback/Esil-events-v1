import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuoteSuggestions } from '../services/aiQuoteService';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [additionalTips, setAdditionalTips] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setAnswers({});
    setSuggestions([]);
    setAdditionalTips('');
    // Start conversation with first question
    addBotMessage(conversationFlow[0].question);
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
    scrollToBottom();
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

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{suggestion.name}</h4>
                <p className="text-gray-600 mt-1">{suggestion.reason}</p>
                {suggestion.type === 'package' && suggestion.items_included && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Inclus :</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {suggestion.items_included.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {suggestion.type === 'product'
                    ? `${suggestion.estimated_price_per_unit}€/unité`
                    : `${suggestion.estimated_total_price}€`}
                </p>
                <button
                  onClick={() => {
                    // TODO: Add to quote functionality
                    addBotMessage(`J'ai ajouté "${suggestion.name}" à votre devis.`);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Ajouter au devis
                </button>
              </div>
            </div>
          </div>
        ))}
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
              className="px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
              className="px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
              className="px-4 py-2 border rounded-lg flex-grow"
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${isMaximized ? 'inset-4' : 'bottom-20 right-4 w-96'} h-[600px] bg-white rounded-lg shadow-xl flex flex-col z-50`}
          >
            {/* Chat header */}
            <div className="p-4 bg-blue-500 text-white rounded-t-lg flex justify-between items-center">
              <h3 className="font-semibold">Assistant Devis ESIL Events</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="text-white hover:text-gray-200"
                  title="Réinitialiser la conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="text-white hover:text-gray-200"
                >
                  {isMaximized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              {renderSuggestions()}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t">
              {renderInput()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}; 