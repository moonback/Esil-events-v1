import React from 'react';
import styled from 'styled-components';
import { FaCheck, FaCircle, FaRedo } from 'react-icons/fa';
import { useChecklist } from '../../hooks/useChecklist';
import { ChecklistItem } from '../../services/interactionService';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 0.5rem 0;
`;

const Title = styled.h4`
  margin: 0 0 1rem 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li<{ completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: ${props => props.completed ? '#666' : '#333'};
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  opacity: ${props => props.completed ? 0.7 : 1};
`;

const Checkbox = styled.button<{ completed: boolean }>`
  background: none;
  border: none;
  color: ${props => props.completed ? '#28a745' : '#ccc'};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${props => props.completed ? '#218838' : '#999'};
  }
`;

const Category = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const CategoryTitle = styled.h5`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const ResetButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 1rem;

  &:hover {
    color: #333;
  }
`;

interface ChecklistDisplayProps {
  checklistId: string;
  title: string;
  items: ChecklistItem[];
  onItemToggle: (itemId: string) => void;
}

export const ChecklistDisplay: React.FC<ChecklistDisplayProps> = ({
  checklistId,
  title,
  items: initialItems,
  onItemToggle
}) => {
  const { items, toggleItem, resetChecklist } = useChecklist(checklistId, initialItems);

  // Grouper les items par catégorie
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Général';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const handleItemToggle = (itemId: string) => {
    toggleItem(itemId);
    onItemToggle(itemId);
  };

  return (
    <Container>
      <Title>{title}</Title>
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Category key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          <List>
            {categoryItems.map(item => (
              <ListItem key={item.id} completed={item.completed}>
                <Checkbox
                  completed={item.completed}
                  onClick={() => handleItemToggle(item.id)}
                  aria-label={item.completed ? 'Marquer comme non complété' : 'Marquer comme complété'}
                >
                  {item.completed ? <FaCheck /> : <FaCircle />}
                </Checkbox>
                {item.text}
              </ListItem>
            ))}
          </List>
        </Category>
      ))}
      <ResetButton onClick={resetChecklist}>
        <FaRedo /> Réinitialiser la checklist
      </ResetButton>
    </Container>
  );
}; 