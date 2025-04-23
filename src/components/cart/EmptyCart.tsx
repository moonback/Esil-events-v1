import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyCartProps } from './types';

const EmptyCart: React.FC<EmptyCartProps> = ({ 
  message = "Vous n'avez pas encore ajouté de produits à votre devis."
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h2 className="text-xl font-medium mb-4">Votre panier est vide</h2>
      <p className="mb-6">{message}</p>
      <Link to="/" className="btn-primary">
        Découvrir nos produits
      </Link>
    </div>
  );
};

export default EmptyCart;