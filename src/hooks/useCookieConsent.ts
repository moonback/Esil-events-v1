import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie-consent-status';

type ConsentStatus = 'accepted' | 'rejected' | null;

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<ConsentStatus>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    }
    return null;
  });

  const acceptAll = () => {
    setConsent('accepted');
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
  };

  const rejectAll = () => {
    setConsent('rejected');
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
  };

  const resetConsent = () => {
    setConsent(null);
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  };

  return {
    consent,
    acceptAll,
    rejectAll,
    resetConsent,
    hasConsent: consent !== null
  };
}; 