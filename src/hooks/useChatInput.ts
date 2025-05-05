import { useState, useRef, useCallback } from 'react';
import { Product } from '../types/Product';

/**
 * Options pour le hook useChatInput
 */
interface UseChatInputOptions {
  onSendMessage?: (text: string) => void;
  onProductSearch?: (query: string) => void;
}

/**
 * Hook personnalisé pour gérer l'entrée de texte du chat
 */
export const useChatInput = (options: UseChatInputOptions = {}) => {
  const { onSendMessage, onProductSearch } = options;

  // États pour l'entrée utilisateur
  const [input, setInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  
  // Référence à l'élément input
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Gérer les changements dans le champ de saisie
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Mettre à jour la position du curseur
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Détecter si l'utilisateur tape @
    const atSymbolIndex = value.lastIndexOf('@', cursorPos);
    
    if (atSymbolIndex !== -1 && atSymbolIndex < cursorPos) {
      // Extraire le texte après @ jusqu'à la position du curseur
      const searchText = value.substring(atSymbolIndex + 1, cursorPos).trim();
      setProductSearchQuery(searchText);
      setIsSearchingProducts(true);
      
      // Appeler le callback de recherche si fourni
      if (onProductSearch) {
        onProductSearch(searchText);
      }
    } else {
      setIsSearchingProducts(false);
      setProductSearchQuery('');
    }
  }, [onProductSearch]);

  /**
   * Gérer l'envoi d'un message
   */
  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    // Appeler le callback d'envoi si fourni
    if (onSendMessage) {
      onSendMessage(input);
    }
    
    // Réinitialiser l'entrée
    setInput('');
    setIsSearchingProducts(false);
    setProductSearchQuery('');
    
    // Focus sur l'input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [input, onSendMessage]);

  /**
   * Gérer la sélection d'un produit dans les résultats de recherche
   */
  const handleProductSelect = useCallback((product: Product) => {
    // Trouver l'index du @ dans l'input
    const atSymbolIndex = input.lastIndexOf('@', cursorPosition);
    
    if (atSymbolIndex !== -1) {
      // Remplacer le texte entre @ et la position du curseur par le nom du produit
      const beforeAt = input.substring(0, atSymbolIndex);
      const afterCursor = input.substring(cursorPosition);
      const newInput = `${beforeAt}@${product.name} ${afterCursor}`;
      
      setInput(newInput);
      // Réinitialiser la recherche
      setIsSearchingProducts(false);
      setProductSearchQuery('');
      
      // Focus sur l'input et placer le curseur après le nom du produit
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newCursorPosition = beforeAt.length + product.name.length + 2; // +2 pour @ et espace
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          setCursorPosition(newCursorPosition);
        }
      }, 0);
    }
  }, [input, cursorPosition]);

  /**
   * Gérer l'appui sur la touche Entrée
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    input,
    setInput,
    inputRef,
    cursorPosition,
    isSearchingProducts,
    productSearchQuery,
    handleInputChange,
    handleSendMessage,
    handleProductSelect,
    handleKeyDown
  };
};