import React from 'react';
import styled from 'styled-components';
import { getProductImage } from '../../config/images';

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

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
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

const Price = styled.span`
  font-weight: bold;
  color: #2c5282;
`;

interface ProductSuggestionCardProps {
  productId: string;
  title: string;
  description: string;
  price: number;
  onClick: () => void;
}

export const ProductSuggestionCard: React.FC<ProductSuggestionCardProps> = ({
  productId,
  title,
  description,
  price,
  onClick
}) => {
  const imageUrl = getProductImage(productId);

  return (
    <Card onClick={onClick}>
      <Image src={imageUrl} alt={title} />
      <Title>{title}</Title>
      <Description>{description}</Description>
      <Price>{price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</Price>
    </Card>
  );
}; 