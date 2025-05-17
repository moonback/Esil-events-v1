import { useState, useEffect } from 'react';
import { ChecklistItem } from '../services/interactionService';

const STORAGE_KEY = 'chatbot_checklists';

export const useChecklist = (checklistId: string, initialItems: ChecklistItem[]) => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    // Charger l'état sauvegardé au démarrage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const allChecklists = JSON.parse(savedState);
      return allChecklists[checklistId] || initialItems;
    }
    return initialItems;
  });

  // Sauvegarder l'état à chaque modification
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const allChecklists = savedState ? JSON.parse(savedState) : {};
    allChecklists[checklistId] = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allChecklists));
  }, [items, checklistId]);

  const toggleItem = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const resetChecklist = () => {
    setItems(initialItems);
  };

  return {
    items,
    toggleItem,
    resetChecklist
  };
}; 