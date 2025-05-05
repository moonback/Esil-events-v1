import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Package, Calendar, Wallet, FileText } from 'lucide-react';
import { EventContext } from '../../hooks/useEventContext';

interface EventQuestionnaireProps {
  eventContext: EventContext;
  updateEventContext: (newContext: Partial<EventContext>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const EventQuestionnaire: React.FC<EventQuestionnaireProps> = ({
  eventContext,
  updateEventContext,
  onSubmit,
  onClose
}) => {
  const isFormValid = eventContext.eventType && 
                     eventContext.eventDate && 
                     eventContext.budget && 
                     eventContext.locationType.length && 
                     eventContext.text;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
      >
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-full">
              <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              Informations pour votre future location
            </h3>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fermer le questionnaire"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} />
          </motion.button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="p-4 sm:p-6 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50 mb-6">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Pour vous aider à choisir le matériel adapté à votre événement, nous avons besoin de quelques informations sur vos besoins en location.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Type d'événement */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type d'événement organisé
                </label>
              </div>
              <select
                value={eventContext.eventType}
                onChange={(e) => updateEventContext({ eventType: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Sélectionnez un type d'événement</option>
                <option value="Mariage">Mariage</option>
                <option value="Conférence">Conférence</option>
                <option value="Concert">Concert</option>
                <option value="Festival">Festival</option>
                <option value="Séminaire d'entreprise">Séminaire d'entreprise</option>
                <option value="Salon professionnel">Salon professionnel</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Soirée privée">Soirée privée</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            {/* Date de l'événement */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date de location prévue
                </label>
              </div>
              <input
                type="date"
                value={eventContext.eventDate}
                onChange={(e) => updateEventContext({ eventDate: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Budget */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Wallet className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Budget approximatif
                </label>
              </div>
              <select
                value={eventContext.budget}
                onChange={(e) => updateEventContext({ budget: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Sélectionnez une fourchette de budget</option>
                <option value="Moins de 500€">Moins de 500€</option>
                <option value="500€ - 1000€">500€ - 1000€</option>
                <option value="1000€ - 3000€">1000€ - 3000€</option>
                <option value="3000€ - 5000€">3000€ - 5000€</option>
                <option value="5000€ - 10000€">5000€ - 10000€</option>
                <option value="Plus de 10000€">Plus de 10000€</option>
              </select>
            </div>
            
            {/* Explication */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expliquez votre projet en quelques lignes
                </label>
              </div>
              <textarea
                value={eventContext.text}
                onChange={(e) => updateEventContext({ text: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent transition-all duration-200 min-h-24 resize-y"
                required
                placeholder="Décrivez les détails de votre événement..."
              />
            </div>
            
            {/* Type de location */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mes besoins en location
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  "Sonorisation",
                  "Éclairage",
                  "Jeux arcade",
                  "Mobilier",
                  "Décoration",
                  "Vidéoprojection",
                  "Scène",
                  "Autre"
                ].map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => {
                      const newTypes = eventContext.locationType.includes(option)
                        ? eventContext.locationType.filter(type => type !== option)
                        : [...eventContext.locationType, option];
                      updateEventContext({ locationType: newTypes });
                    }}
                    className={`p-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      eventContext.locationType.includes(option)
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-700'
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      eventContext.locationType.includes(option)
                        ? 'border-white bg-white/20'
                        : 'border-gray-400 dark:border-gray-500'
                    }`}>
                      {eventContext.locationType.includes(option) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      )}
                    </div>
                    <span className="truncate">{option}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <motion.button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto order-2 sm:order-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-4 h-4" />
            <span>Annuler</span>
          </motion.button>
          
          <motion.button
            onClick={onSubmit}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white w-full sm:w-auto order-1 sm:order-2 ${
              !isFormValid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-700 hover:to-indigo-600 shadow-md hover:shadow-lg shadow-violet-500/20'
            }`}
            whileHover={{ scale: isFormValid ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid ? 0.98 : 1 }}
            disabled={!isFormValid}
          >
            <span>Continuer</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EventQuestionnaire;