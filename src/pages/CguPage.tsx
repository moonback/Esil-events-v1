import React from 'react';

const CguPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conditions Générales d'Utilisation
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Bienvenue sur notre plateforme. Les présentes Conditions Générales d'Utilisation régissent votre utilisation de notre site web et de nos services. En accédant à notre site ou en utilisant nos services, vous acceptez d'être lié par ces conditions.
            </p>
          </section>

          {/* Acceptation des conditions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Acceptation des Conditions
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                En utilisant notre plateforme, vous reconnaissez avoir lu, compris et accepté les présentes conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site ou nos services.
              </p>
            </div>
          </section>

          {/* Inscription et compte */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Inscription et Compte
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Pour accéder à certaines fonctionnalités de notre plateforme, vous devrez créer un compte. Vous êtes responsable de :
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Maintenir la confidentialité de vos identifiants</li>
                <li>Toutes les activités effectuées sous votre compte</li>
                <li>Fournir des informations exactes et à jour</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
              </ul>
            </div>
          </section>

          {/* Utilisation du service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Utilisation du Service
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Vous vous engagez à utiliser nos services conformément aux lois applicables et à ne pas :
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Violer les droits de propriété intellectuelle</li>
                <li>Diffuser du contenu illégal, offensant ou préjudiciable</li>
                <li>Tenter de compromettre la sécurité de notre plateforme</li>
                <li>Utiliser nos services à des fins frauduleuses</li>
                <li>Perturber le fonctionnement normal de notre plateforme</li>
              </ul>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Propriété Intellectuelle
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Tous les contenus présents sur notre plateforme, incluant textes, graphiques, logos, images, et logiciels, sont notre propriété ou celle de nos partenaires et sont protégés par les lois sur la propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
            </p>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Limitation de Responsabilité
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Notre plateforme est fournie "telle quelle" et "selon disponibilité". Nous ne garantissons pas que :
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Le service sera ininterrompu ou sans erreur</li>
                <li>Les défauts seront corrigés</li>
                <li>Le site est exempt de virus ou d'autres éléments nuisibles</li>
                <li>Les résultats obtenus seront exacts ou fiables</li>
              </ul>
            </div>
          </section>

          {/* Modifications des conditions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Modifications des Conditions
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication. Votre utilisation continue de notre plateforme après toute modification constitue votre acceptation des nouvelles conditions.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Nous Contacter
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Pour toute question concernant nos conditions générales d'utilisation, vous pouvez nous contacter :
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Contactez-nous
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CguPage;
