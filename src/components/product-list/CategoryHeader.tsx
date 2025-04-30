import React from 'react';

interface CategoryHeaderProps {
  name: string;
  description?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ name, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {name || 'Tous nos produits'}
      </h1>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default CategoryHeader;