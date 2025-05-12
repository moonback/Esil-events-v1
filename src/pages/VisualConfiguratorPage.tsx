import React from 'react';
import { VisualConfigurator } from '../components/visual-configurator/VisualConfigurator';

export const VisualConfiguratorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créez votre Ambiance d'Événement
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sélectionnez et combinez nos produits pour créer votre ambiance idéale. 
            Visualisez votre événement avant même de commencer à organiser.
          </p>
        </div>
        <VisualConfigurator />
      </div>
    </div>
  );
}; 