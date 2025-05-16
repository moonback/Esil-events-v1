import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ThemeCard = styled.div<{ $isActive: boolean }>`
  padding: 20px;
  border-radius: 8px;
  border: 2px solid ${props => props.$isActive ? '#4CAF50' : '#ddd'};
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$isActive ? '#f0f9f0' : 'white'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ThemeTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`;

const ThemeDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9em;
`;

const ThemeSettings: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  const themes = [
    {
      id: 'default',
      title: 'Thème par défaut',
      description: 'Aucun effet festif'
    },
    {
      id: 'christmas',
      title: 'Thème Noël',
      description: 'Effet de neige et ambiance festive'
    },
    {
      id: 'valentine',
      title: 'Thème Saint-Valentin',
      description: 'Cœurs flottants et ambiance romantique'
    }
  ];

  return (
    <Container>
      <Title>Paramètres des thèmes festifs</Title>
      <ThemeGrid>
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            $isActive={currentTheme === theme.id}
            onClick={() => setTheme(theme.id as 'default' | 'christmas' | 'valentine')}
          >
            <ThemeTitle>{theme.title}</ThemeTitle>
            <ThemeDescription>{theme.description}</ThemeDescription>
          </ThemeCard>
        ))}
      </ThemeGrid>
    </Container>
  );
};

export default ThemeSettings; 