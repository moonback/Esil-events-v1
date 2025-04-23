import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CartSummaryProps } from './types';

const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckoutClick }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <Link to="/" className="flex items-center text-black hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Continuer mes achats
      </Link>
      <button
        onClick={onCheckoutClick}
        className="btn-primary"
      >
        Demander un devis
      </button>
    </div>
  );
};

export default CartSummary;