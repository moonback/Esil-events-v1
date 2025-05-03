import React from 'react';
import ProductChatbot from '../components/ProductChatbot';
import SEO from '../components/SEO';


const ChatbotPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900 overflow-hidden">
      <SEO 
        title="Assistant Virtuel ESIL Events - Votre guide interactif"
        description="Découvrez notre assistant virtuel intelligent qui répond instantanément à toutes vos questions sur nos services de location de matériel événementiel. Disponible 24/7 pour vous guider."
        keywords="assistant virtuel ESIL Events, chatbot événementiel, aide en ligne événementiel, location matériel assistance, guide interactif événement"
      />

      <div className="max-w-8xl mx-auto">
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
            <li className="mb-2">Les prix et modalité de location</li>
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