import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

// Hooks personnalisés
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatInput } from '../hooks/useChatInput';
import { useChatbotInteraction } from '../hooks/useChatbotInteraction';
import { useEventContext } from '../hooks/useEventContext';
import { useProductSearch } from '../hooks/useProductSearch';

// Composants
import ChatHeader from './chatbot/ChatHeader';
import ChatInput from './chatbot/ChatInput';
import ChatMessages from './chatbot/ChatMessages';
import ChatSuggestions from './chatbot/ChatSuggestions';
import EventQuestionnaire from './chatbot/EventQuestionnaire';

// Styles
import '../styles/chatbot.css';

interface ProductChatbotProps {
  initialQuestion?: string | null;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
}

const ProductChatbot: React.FC<ProductChatbotProps> = ({
  initialQuestion = null,
  onClose,
  onToggleFullScreen,
  isFullScreen
}) => {
  // État pour les paramètres du chatbot
  const [showSettings, setShowSettings] = useState(false);
  const [enableCache, setEnableCache] = useState(false);

  // Utilisation des hooks personnalisés
  const {
    products,
    isLoading: isProductsLoading,
    searchResults: productSearchResults,
    searchProductsByName,
    detectProductMentions,
    detectComparisonRequest
  } = useProductSearch();

  const {
    eventContext,
    updateEventContext,
    eventContextCollected,
    showEventQuestionnaire,
    setShowEventQuestionnaire,
    submitEventContext,
    resetEventContext,
    getSearchAnchor
  } = useEventContext();

  const {
    isLoading,
    setIsLoading,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    showSuggestionsButton,
    setShowSuggestionsButton,
    searchAnchor,
    setSearchAnchor,
    generateResponse,
    generateComparisonResponse,
    updateSuggestions,
    enableCache: chatbotEnableCache
  } = useChatbotInteraction({ enableCache });

  const {
    messages,
    addUserMessage,
    addBotMessage,
    addErrorMessage,
    resetConversation,
    getMessageHistory
  } = useChatMessages();

  const {
    input,
    inputRef,
    isSearchingProducts,
    handleInputChange,
    handleSendMessage: handleInputSend,
    handleProductSelect,
    handleKeyDown
  } = useChatInput({
    onSendMessage: (text) => handleSendMessage(text),
    onProductSearch: searchProductsByName
  });

  // Mettre à jour les suggestions lorsque les messages ou les produits changent
  useEffect(() => {
    if (messages.length > 0 && products.length > 0) {
      updateSuggestions(products, getMessageHistory());
    }
  }, [messages, products, updateSuggestions, getMessageHistory]);

  // Mettre à jour l'ancrage de recherche lorsque le contexte d'événement change
  useEffect(() => {
    if (eventContextCollected) {
      setSearchAnchor(getSearchAnchor());
    }
  }, [eventContextCollected, getSearchAnchor, setSearchAnchor]);

  // Envoyer la question initiale si elle est fournie
  useEffect(() => {
    if (initialQuestion && !isLoading && products.length > 0) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion, isLoading, products.length]);

  // Gérer l'envoi d'un message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Masquer les suggestions après envoi d'un message
    setShowSuggestions(false);
    setShowSuggestionsButton(false);

    // Détecter les produits mentionnés dans le message
    const mentionedProducts = detectProductMentions(text);

    // Ajouter le message de l'utilisateur
    addUserMessage(text, mentionedProducts);

    setIsLoading(true);

    try {
      // Détecter si c'est une demande de comparaison
      const { isComparison, productsToCompare } = detectComparisonRequest(text);

      // Construire le contexte d'information si disponible
      let contextualInfo = '';
      if (eventContextCollected) {
        contextualInfo = `Contexte: ${eventContext.eventType}, date: ${eventContext.eventDate}, budget: ${eventContext.budget}, type de location: ${eventContext.locationType.join(', ')}, ${eventContext.text}`;
      }

      // Générer une réponse
      let response;
      if (isComparison && productsToCompare.length >= 2) {
        response = await generateComparisonResponse(
          text,
          productsToCompare,
          products,
          getMessageHistory()
        );
      } else {
        response = await generateResponse(
          text,
          products,
          getMessageHistory(),
          contextualInfo
        );
      }

      // Détecter les produits mentionnés dans la réponse
      const botMentionedProducts = detectProductMentions(response.text);

      // Ajouter la réponse du bot
      addBotMessage(response.text, botMentionedProducts, response.source);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      addErrorMessage();
    } finally {
      setIsLoading(false);
      // Réafficher le bouton de suggestions après un délai
      setTimeout(() => setShowSuggestionsButton(true), 1000);
    }
  };

  // Gérer le clic sur une question suggérée
  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Gérer la soumission du questionnaire contextuel
  const handleEventContextSubmit = () => {
    if (submitEventContext()) {
      // Mettre à jour l'ancrage de recherche avec le type d'événement
      setSearchAnchor(eventContext.eventType);

      // Ajouter un message de confirmation
      addBotMessage(
        `Merci pour ces informations ! Je vais adapter mes recommandations pour votre ${eventContext.eventType} prévu le ${eventContext.eventDate} avec un budget d'environ ${eventContext.budget} et un besoin en ${eventContext.locationType.join(', ')}. Comment puis-je vous aider maintenant ?`
      );
    }
  };

  // Effacer l'historique de conversation
  const handleResetConversation = () => {
    resetConversation();
    resetEventContext();
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-white via-violet-50 to-violet-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <ChatHeader
        onSettingsClick={() => setShowSettings(!showSettings)}
        onResetClick={handleResetConversation}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        isFullScreen={isFullScreen}
      />

      {/* Questionnaire contextuel d'événement */}
      <AnimatePresence>
        {showEventQuestionnaire && (
          <EventQuestionnaire
            eventContext={eventContext}
            updateEventContext={updateEventContext}
            onSubmit={handleEventContextSubmit}
            onClose={() => setShowEventQuestionnaire(false)}
          />
        )}
      </AnimatePresence>

      {/* Panneau de paramètres */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 border-b border-gray-200 dark:border-gray-700 shadow-lg"
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Settings className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
                  Paramètres du chatbot
                </h3>
              </div>

              {/* Informations sur l'événement */}
              <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Informations sur votre location</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {eventContextCollected ? (
                          <span className="text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Type d'événement:</span> {eventContext.eventType} |{' '}
                            <span className="font-medium">Date:</span> {eventContext.eventDate} |{' '}
                            <span className="font-medium">Budget:</span> {eventContext.budget} |{' '}
                            <span className="font-medium">Équipements:</span> {eventContext.locationType.join(', ')}
                            <span className="font-medium">Équipements:</span> {eventContext.text}

                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">
                            Aucune information contextuelle spécifiée
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEventQuestionnaire(!showEventQuestionnaire);
                      setShowSettings(false); // Fermer le panneau de réglages
                    }}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline"
                  >
                    {eventContextCollected ? "Modifier" : "Spécifier"}
                  </button>
                </div>
              </div>

              {/* Cache des réponses */}
              <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Cache des réponses</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {enableCache ? 'Activé - Utilise les réponses en cache' : 'Désactivé - Requêtes fraîches uniquement'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnableCache(!enableCache)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 ${enableCache ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className="sr-only">Toggle cache</span>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${enableCache ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Suggestions */}
      <ChatSuggestions
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onSuggestionClick={handleSuggestedQuestion}
        onClose={() => setShowSuggestions(false)}
      />

      {/* Input */}
      <ChatInput
        input={input}
        inputRef={inputRef}
        isLoading={isLoading}
        isSearchingProducts={isSearchingProducts}
        productSearchResults={productSearchResults}
        showSuggestions={showSuggestions}
        showSuggestionsButton={showSuggestionsButton}
        suggestions={suggestions}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSendMessage={handleInputSend}
        onProductSelect={handleProductSelect}
        onShowSuggestions={() => setShowSuggestions(true)}
        onHideSuggestions={() => setShowSuggestions(false)}
      />
    </div>
  );
};

export default ProductChatbot;