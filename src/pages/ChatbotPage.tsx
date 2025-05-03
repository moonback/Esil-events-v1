import React from 'react';
import ProductChatbot from '../components/ProductChatbot';
// import { Helmet } from 'react-helmet';

const ChatbotPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <Helmet>
        <title>Assistant Virtuel - ESIL Events</title>
        <meta name="description" content="Posez vos questions à notre assistant virtuel pour obtenir des informations sur nos produits de location pour vos événements." />
      </Helmet> */}

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Assistant Virtuel ESIL Events</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Comment puis-je vous aider ?</h2>
          <p className="mb-4">
            Notre assistant virtuel est là pour répondre à toutes vos questions concernant nos produits et services de location pour vos événements.
          </p>
          <p className="mb-4">
            Vous pouvez lui demander des informations sur :
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Nos produits disponibles à la location</li>
            <li className="mb-2">Les caractéristiques techniques de nos équipements</li>
            <li className="mb-2">Les prix et disponibilités</li>
            <li className="mb-2">Des recommandations selon vos besoins</li>
            <li className="mb-2">Nos services d'installation et de livraison</li>
          </ul>
          <p className="text-sm text-gray-600">
            Note : L'assistant a accès à notre catalogue complet de produits et s'efforce de fournir les informations les plus précises. Pour des demandes spécifiques ou pour finaliser une réservation, nous vous recommandons de contacter directement notre équipe commerciale.
          </p>
        </div>

        {/* Intégration du chatbot */}
        <div className="relative h-[600px] border border-gray-200 rounded-lg shadow-lg">
          <ProductChatbot />
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;