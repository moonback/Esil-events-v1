import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Package } from 'lucide-react';
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
  return (
    <motion.div 
      className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-6 border-b border-gray-200 dark:border-gray-700 shadow-lg"
      initial={{ height: 0, opacity: 0, y: -20 }}
      animate={{ height: 'auto', opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
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
        
        <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Pour vous aider à choisir le matériel adapté à votre événement, nous avons besoin de quelques informations sur vos besoins en location.
          </p>
          
          {/* Type d'événement */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type d'événement organisé
            </label>
            <select
              value={eventContext.eventType}
              onChange={(e) => updateEventContext({ eventType: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de location prévue
            </label>
            <input
              type="date"
              value={eventContext.eventDate}
              onChange={(e) => updateEventContext({ eventDate: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget approximatif
            </label>
            <select
              value={eventContext.budget}
              onChange={(e) => updateEventContext({ budget: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-700 border border-violet-200 dark:border-violet-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent"
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
          
          {/* Type de location */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                <Package className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <label className="text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Mes besoins en location
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    eventContext.locationType.includes(option)
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    eventContext.locationType.includes(option)
                      ? 'border-white bg-white/20'
                      : 'border-gray-400 dark:border-gray-600'
                  }`}>
                    {eventContext.locationType.includes(option) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <motion.button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Ignorer</span>
              <X className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={onSubmit}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType.length ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'}`}
              whileHover={{ scale: !eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType.length ? 1 : 1.05 }}
              whileTap={{ scale: !eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType.length ? 1 : 0.95 }}
              disabled={!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType.length}
            >
              <span>Continuer</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventQuestionnaire;