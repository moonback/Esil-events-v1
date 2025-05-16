import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="J'accepte"
      cookieName="esil-events-consent"
      style={{ 
        background: "rgba(255, 255, 255, 0.95)",
        padding: "1.5rem",
        fontSize: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        color: "#333",
        fontFamily: "inherit",
        maxWidth: "100%",
        margin: "0 auto",
        zIndex: "9999"
      }}
      buttonStyle={{
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
      expires={150}
      overlayStyle={{
        background: "rgba(0, 0, 0, 0.5)"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
        Ce site utilise des cookies pour améliorer votre expérience. En continuant à naviguer sur ce site, vous acceptez notre utilisation des cookies.{" "}
        <Link 
          to="/privacy" 
          style={{ 
            color: "#000", 
            textDecoration: "underline",
            fontWeight: "500",
            marginLeft: "5px"
          }}
        >
          En savoir plus
        </Link>
      </div>
    </CookieConsent>
  );
};

export default CookieConsentBanner; 