import React from 'react';
import { Link } from 'react-router-dom';
import { SuccessMessageProps } from './types';

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  title = "Demande envoyée avec succès !",
  message = "Merci pour votre demande de devis. Notre équipe va l'étudier et vous contactera dans les plus brefs délais.",
  buttonText = "Retour à l'accueil",
  buttonLink = "/"
}) => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container-custom mx-auto max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="mb-6">{message}</p>
          <Link to={buttonLink} className="btn-primary">
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;