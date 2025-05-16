import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export type CookieConsentType = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

const COOKIE_NAME = 'esil-events-consent';
const COOKIE_EXPIRY_DAYS = 150;

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsentType | null>(null);

  useEffect(() => {
    const savedConsent = Cookies.get(COOKIE_NAME);
    if (savedConsent) {
      try {
        setConsent(JSON.parse(savedConsent));
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
      }
    }
  }, []);

  const acceptAll = () => {
    const newConsent: CookieConsentType = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    Cookies.set(COOKIE_NAME, JSON.stringify(newConsent), { expires: COOKIE_EXPIRY_DAYS });
    setConsent(newConsent);
    // Activer tous les scripts de tracking
    enableAllTracking();
  };

  const rejectAll = () => {
    const newConsent: CookieConsentType = {
      necessary: true, // Les cookies nécessaires sont toujours acceptés
      analytics: false,
      marketing: false,
      preferences: false
    };
    Cookies.set(COOKIE_NAME, JSON.stringify(newConsent), { expires: COOKIE_EXPIRY_DAYS });
    setConsent(newConsent);
    // Désactiver tous les scripts de tracking non nécessaires
    disableNonEssentialTracking();
  };

  const updateConsent = (newConsent: Partial<CookieConsentType>) => {
    const updatedConsent = { ...consent, ...newConsent } as CookieConsentType;
    Cookies.set(COOKIE_NAME, JSON.stringify(updatedConsent), { expires: COOKIE_EXPIRY_DAYS });
    setConsent(updatedConsent);
    // Mettre à jour les scripts en fonction des nouvelles préférences
    updateTrackingScripts(updatedConsent);
  };

  return {
    consent,
    acceptAll,
    rejectAll,
    updateConsent
  };
};

// Fonctions utilitaires pour gérer les scripts de tracking
const enableAllTracking = () => {
  // Activer Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted',
      'ad_storage': 'granted'
    });
  }
  // Activer d'autres scripts de tracking ici
};

const disableNonEssentialTracking = () => {
  // Désactiver Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied'
    });
  }
  // Désactiver d'autres scripts de tracking ici
};

const updateTrackingScripts = (consent: CookieConsentType) => {
  if (window.gtag) {
    window.gtag('consent', 'update', {
      'analytics_storage': consent.analytics ? 'granted' : 'denied',
      'ad_storage': consent.marketing ? 'granted' : 'denied'
    });
  }
  // Mettre à jour d'autres scripts en fonction des préférences
};

// Déclaration pour TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
} 