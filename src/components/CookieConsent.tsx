import React, { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookieConsentBanner: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { acceptAll, rejectAll, consent } = useCookieConsent();
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleReject = () => {
    rejectAll();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255, 255, 255, 0.98)",
        padding: "2rem",
        fontSize: "14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        color: "#333",
        fontFamily: "inherit",
        maxWidth: "100%",
        margin: "0 auto",
        zIndex: "9999",
        lineHeight: "1.6"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "left" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "18px", fontWeight: "600" }}>
          Nous prenons à cœur de protéger vos données
        </h3>
        
        <p style={{ marginBottom: "1rem" }}>
          Nous et nos partenaires stockons et accédons à des données personnelles, telles que des données de navigation ou des identifiants uniques, sur votre appareil. Si vous sélectionnez « J'accepte », les technologies de suivi prendront en charge les finalités affichées ci-dessous. Si vous choisissez « Tout refuser », elles seront désactivées.
        </p>

        {showDetails && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "0.5rem" }}>
              Nos équipes ainsi que nos partenaires externes, traitent des données selon les finalités suivantes :
            </h4>
            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li>Utiliser des données de géolocalisation précises</li>
              <li>Analyser activement les caractéristiques de l'appareil pour l'identification</li>
              <li>Stocker et/ou accéder à des informations sur un appareil</li>
              <li>Publicités et contenu personnalisés, mesure de performance des publicités et du contenu</li>
              <li>Études d'audience et développement de services</li>
            </ul>
            <p style={{ marginBottom: "1rem", fontStyle: "italic" }}>
              Si les traceurs sont désactivés, certains contenus et annonces que vous voyez peuvent ne pas être pertinents pour vous.
            </p>
          </div>
        )}

        <p style={{ marginBottom: "1.5rem" }}>
          Vous pouvez faire réapparaître ce menu pour modifier vos choix ou pour retirer votre consentement à tout moment en cliquant sur le lien Gérer mes préférences en bas de la page web.
        </p>

        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={handleReject}
            style={{
              background: "transparent",
              border: "1px solid #000",
              padding: "0.8rem 2rem",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              color: "#000"
            }}
          >
            Tout refuser
          </button>
          <button
            onClick={handleAccept}
            style={{
              background: "#000",
              color: "white",
              fontSize: "14px",
              padding: "0.8rem 2rem",
              borderRadius: "30px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.3s ease",
              minWidth: "120px"
            }}
          >
            J'accepte
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: "transparent",
              border: "1px solid #000",
              padding: "0.8rem 2rem",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
          >
            {showDetails ? "Masquer les détails" : "Afficher les détails"}
          </button>
          <Link 
            to="/privacy" 
            style={{ 
              color: "#000", 
              textDecoration: "underline",
              fontWeight: "500",
              padding: "0.8rem 2rem",
              fontSize: "14px"
            }}
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner; 