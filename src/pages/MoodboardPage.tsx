import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getMoodboardDetails } from '../services/interactionService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0 0 1rem 0;
  color: #333;
`;

const Description = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
`;

const Tags = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #666;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const Image = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
`;

const MoodboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const moodboard = id ? getMoodboardDetails(id) : null;

  if (!moodboard) {
    return (
      <Container>
        <h2>Moodboard non trouvé</h2>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{moodboard.title}</Title>
        <Description>{moodboard.description}</Description>
        <Tags>
          {moodboard.tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </Tags>
      </Header>

      <ImageGrid>
        {moodboard.images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`${moodboard.title} - Image ${index + 1}`}
          />
        ))}
      </ImageGrid>
    </Container>
  );
};

export default MoodboardPage; 