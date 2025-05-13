import React from 'react';
import { VisualConfigurator } from '../components/visual-configurator/VisualConfigurator';
import { SparklesIcon, LightBulbIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

export const VisualConfiguratorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-12xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Créez votre Ambiance d'Événement
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Sélectionnez et combinez nos produits pour créer votre ambiance idéale. 
            Visualisez votre événement avant même de commencer à organiser.
          </p>
          
          {/* Fonctionnalités du configurateur */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-violet-100 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <SparklesIcon className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assistant IA</h3>
              <p className="text-gray-600">
                Décrivez votre événement et notre IA vous suggère les produits les plus adaptés à vos besoins spécifiques.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-violet-100 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <CubeTransparentIcon className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualisation 3D</h3>
              <p className="text-gray-600">
                Glissez-déposez les produits pour créer votre configuration et visualisez votre sélection en temps réel.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-violet-100 hover:shadow-lg transition-all">
              <div className="flex justify-center mb-4">
                <LightBulbIcon className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Devis Instantané</h3>
              <p className="text-gray-600">
                Obtenez un devis détaillé en temps réel et finalisez votre commande en quelques clics.
              </p>
            </div>
          </div> */}
        </div>
        
        <VisualConfigurator />
      </div>
    </div>
  );
};