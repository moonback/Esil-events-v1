import React from 'react';
import { CartItem } from './types';
import { motion } from 'framer-motion';

interface CartSummaryPreviewProps {
  items: CartItem[];
  deliveryEstimation?: {
    deliveryCost: number;
    installationCost: number;
    requiredPersonnel: {
      delivery: number;
      installation: number;
    };
    estimatedDuration: {
      delivery: string;
      installation: string;
    };
    notes: string[];
  };
}

const CartSummaryPreview: React.FC<CartSummaryPreviewProps> = ({ items, deliveryEstimation }) => {
  const subtotal = items.reduce((total, item) => total + (item.priceTTC * item.quantity), 0);
  const total = subtotal + (deliveryEstimation?.deliveryCost || 0) + (deliveryEstimation?.installationCost || 0);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-semibold mb-4">Récapitulatif de votre commande</h3>
      
      <div className="space-y-4">
        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                {item.name} x {item.quantity}
                {item.color && <span className="ml-2 text-gray-500">({item.color})</span>}
              </span>
              <span className="font-medium">{(item.priceTTC * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="border-t pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">Sous-total</span>
            <span className="font-medium">{subtotal.toFixed(2)} €</span>
          </div>
        </div>

        {/* Delivery and Installation Costs */}
        {deliveryEstimation && (
          <>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Frais de livraison</span>
                <span className="font-medium">{deliveryEstimation.deliveryCost.toFixed(2)} €</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Durée estimée: {deliveryEstimation.estimatedDuration.delivery}
                <br />
                Personnel requis: {deliveryEstimation.requiredPersonnel.delivery} personne(s)
              </div>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Frais d'installation</span>
                <span className="font-medium">{deliveryEstimation.installationCost.toFixed(2)} €</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Durée estimée: {deliveryEstimation.estimatedDuration.installation}
                <br />
                Personnel requis: {deliveryEstimation.requiredPersonnel.installation} personne(s)
              </div>
            </div>

            {deliveryEstimation.notes.length > 0 && (
              <div className="border-t pt-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Notes importantes:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {deliveryEstimation.notes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Total */}
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total TTC</span>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {total.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummaryPreview;
