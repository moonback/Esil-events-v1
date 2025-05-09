import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  image: string;
  priceTTC: number;
  quantity: number;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage key for localStorage
const CART_STORAGE_KEY = 'esil_events_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or empty array
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Update localStorage whenever cart items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    // Nous ne déclenchons plus l'événement ici pour éviter les doubles notifications
    // car nous le déclenchons déjà dans la fonction addToCart
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    // Mettre à jour l'état des items du panier
    setItems(currentItems => {
      let newItems;
      const existingItem = currentItems.find(item => item.id === newItem.id);
      if (existingItem) {
        newItems = currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        newItems = [...currentItems, newItem];
      }
      
      // Mettre à jour le localStorage immédiatement
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
      
      // Déclencher un événement personnalisé pour notifier les autres composants
      const cartUpdateEvent = new CustomEvent('cart-updated', { detail: newItems });
      window.dispatchEvent(cartUpdateEvent);
      
      return newItems;
    });
  };

  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
