import React from 'react';
import { CartItem } from './types';

interface CartSummaryPreviewProps {
  items: CartItem[];
}

const CartSummaryPreview: React.FC<CartSummaryPreviewProps> = ({ items }) => {
  // Calculer le total du panier
  const cartTotal = items.reduce((total, item) => total + (item.priceTTC * item.quantity), 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-3">Récapitulatif de votre demande</h3>
      
      <div className="max-h-60 overflow-y-auto mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center py-2 border-b border-gray-200 last:border-0">
            <div className="w-16 h-16 flex-shrink-0 mr-4 bg-gray-100 rounded overflow-hidden">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-grow">
              <h4 className="font-medium">{item.name}</h4>
              <div className="text-sm text-gray-600">
                <span>Quantité: {item.quantity}</span>
                {item.color && <span className="ml-2">Couleur: {item.color}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{(item.priceTTC * item.quantity).toFixed(2)} €</div>
              <div className="text-sm text-gray-600">{item.priceTTC.toFixed(2)} € / unité</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t border-gray-300">
        <span>Total estimatif:</span>
        <span>{cartTotal.toFixed(2)} € TTC</span>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>Ce montant est donné à titre indicatif. Le devis final pourra être ajusté en fonction de vos besoins spécifiques.</p>
      </div>
    </div>
  );
};

export default CartSummaryPreview;