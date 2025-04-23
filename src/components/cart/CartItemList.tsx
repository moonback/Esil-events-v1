import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItemListProps } from './types';

const CartItemList: React.FC<CartItemListProps> = ({ items, removeFromCart, updateQuantity }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-4 px-6 text-left">Produit</th>
            <th className="py-4 px-6 text-center">Quantité</th>
            <th className="py-4 px-6 text-right">Prix TTC</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    {item.color && <p className="text-sm text-gray-500">Couleur: {item.color}</p>}
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 border border-gray-300 rounded-l disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 border-t border-b border-gray-300 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border border-gray-300 rounded-r"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-right font-bold">
                {(item.priceTTC).toFixed(2)} €
              </td>
              <td className="py-4 px-6 text-right">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Supprimer ${item.name}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={3} className="py-4 px-6 text-right font-medium">
              Total TTC
            </td>
            <td className="py-4 px-6 text-right font-bold">
              {items.reduce((total, item) => total + (item.priceTTC * item.quantity), 0).toFixed(2)} €
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CartItemList;