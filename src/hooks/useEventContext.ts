import { useState, useEffect, useCallback } from 'react';

/**
 * Interface pour les informations contextuelles de l'événement
 */
export interface EventContext {
  eventType: string;
  eventDate: string;
  budget: string;
  locationType: string[];
  text: string;
}

/**
 * Options pour le hook useEventContext
 */
interface UseEventContextOptions {
  saveToLocalStorage?: boolean;
}

/**
 * Hook personnalisé pour gérer le contexte d'événement
 */
export const useEventContext = (options: UseEventContextOptions = {}) => {
  const { saveToLocalStorage = true } = options;

  // État initial du contexte d'événement
  const [eventContext, setEventContext] = useState<EventContext>({
    eventType: '',
    eventDate: '',
    budget: '',
    locationType: [],
    text: ''
  });

  // État pour suivre si le contexte a été collecté
  const [eventContextCollected, setEventContextCollected] = useState(false);
  
  // État pour contrôler l'affichage du questionnaire
  const [showEventQuestionnaire, setShowEventQuestionnaire] = useState(false);

  // Charger le contexte d'événement depuis le localStorage au montage du composant
  useEffect(() => {
    if (saveToLocalStorage) {
      const savedEventContext = localStorage.getItem('eventContext');
      if (savedEventContext) {
        const parsedEventContext = JSON.parse(savedEventContext);
        setEventContext(parsedEventContext);
        setEventContextCollected(true);
      } else {
        // Si pas de contexte sauvegardé, afficher le questionnaire
        setShowEventQuestionnaire(true);
      }
    }
  }, [saveToLocalStorage]);

  /**
   * Mettre à jour le contexte d'événement
   */
  const updateEventContext = useCallback((newContext: Partial<EventContext>) => {
    setEventContext(prev => ({
      ...prev,
      ...newContext
    }));
  }, []);

  /**
   * Soumettre le questionnaire contextuel
   */
  const submitEventContext = useCallback(() => {
    // Vérifier si tous les champs sont remplis
    if (!eventContext.eventType || !eventContext.eventDate || !eventContext.budget || !eventContext.locationType.length) {
      return false; // Ne pas soumettre si des champs sont vides
    }
    // Note: Le champ text est optionnel et n'est pas vérifié ici
    
    // Marquer le contexte comme collecté
    setEventContextCollected(true);
    setShowEventQuestionnaire(false);
    
    // Sauvegarder le contexte dans localStorage
    if (saveToLocalStorage) {
      localStorage.setItem('eventContext', JSON.stringify(eventContext));
    }
    
    return true;
  }, [eventContext, saveToLocalStorage]);

  /**
   * Réinitialiser le contexte d'événement
   */
  const resetEventContext = useCallback(() => {
    setEventContext({
      eventType: '',
      eventDate: '',
      budget: '',
      locationType: [],
      text: ''
    });
    setEventContextCollected(false);
    setShowEventQuestionnaire(true);
    
    if (saveToLocalStorage) {
      localStorage.removeItem('eventContext');
    }
  }, [saveToLocalStorage]);

  /**
   * Obtenir l'ancrage de recherche basé sur le contexte d'événement
   */
  const getSearchAnchor = useCallback(() => {
    return eventContext.eventType || '';
  }, [eventContext.eventType]);

  return {
    eventContext,
    updateEventContext,
    eventContextCollected,
    showEventQuestionnaire,
    setShowEventQuestionnaire,
    submitEventContext,
    resetEventContext,
    getSearchAnchor
  };
};