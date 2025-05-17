import React from 'react';
import styled from 'styled-components';
import { getMoodboardImages } from '../../config/images';

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin: 0.5rem 0;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Image = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
`;

const Description = styled.p`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background: #e2e8f0;
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
`;

interface MoodboardCardProps {
  moodboardId: string;
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
}

export const MoodboardCard: React.FC<MoodboardCardProps> = ({
  moodboardId,
  title,
  description,
  tags,
  onClick
}) => {
  const images = getMoodboardImages(moodboardId);

  return (
    <Card onClick={onClick}>
      <ImageGrid>
        {images.slice(0, 4).map((image, index) => (
          <Image key={index} src={image} alt={`${title} - Image ${index + 1}`} />
        ))}
      </ImageGrid>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <Tags>
        {tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </Tags>
    </Card>
  );
}; 