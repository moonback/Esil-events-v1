import React from 'react';



const teamMembers = [
  {
    id: 1,
    name: "Thomas Leroy",
    role: "Directeur Général",
    image: "/images/team1.jpg"
  },
  {
    id: 2,
    name: "Sophie Bernard",
    role: "Responsable Commercial",
    image: "/images/team2.jpg"
  },
  {
    id: 3,
    name: "Alexandre Petit",
    role: "Responsable Technique",
    image: "/images/team3.jpg"
  }
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Hero Section avec image de fond */}
        <div className="relative bg-primary-700 dark:bg-primary-800">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="https://www.solutions-evenements.fr/images/carousel/fr/solev-4.webp"
              alt="Matériel événementiel"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative px-6 py-24 sm:px-12 sm:py-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-8">
                <img
                  src="/images/logo.png"
                  alt="ESIL Events Logo"
                  className="h-24 mx-auto mb-6"
                />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4">
                ESIL Events Location
              </h1>
              <p className="mt-6 text-xl text-primary-100 max-w-3xl">
                Votre partenaire de confiance pour la location de matériel événementiel professionnel
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-6 py-12 sm:px-12">
          {/* Notre Mission avec image */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Notre Mission
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Nous mettons à votre disposition un large catalogue de matériel événementiel de qualité professionnelle. Notre mission est de vous fournir tout l'équipement nécessaire pour faire de vos événements une réussite totale.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Équipement professionnel haut de gamme</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Livraison et installation incluses</span>
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Support technique 24/7</span>
                  </li>
                </ul>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <img
                  src="/images/mission.jpg"
                  alt="Notre équipe en action"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </section>

          {/* Notre Matériel avec cards améliorées */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Notre Matériel
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48">
                  <img
                    src="/images/lighting.jpg"
                    alt="Équipement d'éclairage"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <svg className="absolute bottom-4 left-4 h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Éclairage</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Projecteurs LED dernière génération</li>
                    <li>• Machines à fumée professionnelles</li>
                    <li>• Systèmes de contrôle DMX</li>
                    <li>• Stroboscopes et lasers</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48">
                  <img
                    src="/images/sound.jpg"
                    alt="Équipement de sonorisation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <svg className="absolute bottom-4 left-4 h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sonorisation</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Systèmes line array professionnels</li>
                    <li>• Tables de mixage numériques</li>
                    <li>• Micros HF Shure et Sennheiser</li>
                    <li>• Retours de scène</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="relative h-48">
                  <img
                    src="/images/furniture.jpg"
                    alt="Mobilier événementiel"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <svg className="absolute bottom-4 left-4 h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Mobilier & Structures</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• Tentes et chapiteaux</li>
                    <li>• Mobilier design</li>
                    <li>• Bars et comptoirs</li>
                    <li>• Scènes et podiums</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Nos Avantages avec icônes */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Nos Avantages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Matériel Premium</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Équipements de grandes marques, régulièrement entretenus et testés pour garantir une performance optimale.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Service Complet</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Livraison, installation, assistance technique et récupération du matériel inclus.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Disponibilité</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Large stock de matériel pour répondre à vos besoins, même pour les événements de dernière minute.
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Expertise</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Conseils personnalisés pour choisir le matériel adapté à votre événement et votre budget.
                </p>
              </div>
            </div>
          </section>

          {/* Notre Équipe */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Notre Équipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                  <div className="relative h-64">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 mb-4">{member.role}</p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-500 hover:text-primary-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-primary-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-500 hover:text-primary-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA amélioré */}
          <section className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              <img
                src="/images/cta-bg.jpg"
                alt="Background"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900 p-12 rounded-2xl text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Besoin de Matériel pour Votre Événement ?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                Contactez-nous pour obtenir un devis personnalisé et découvrir notre catalogue complet. Notre équipe est à votre disposition pour vous conseiller.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Demander un Devis
                </a>
                <a
                  href="/catalogue"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:scale-105"
                >
                  Voir le Catalogue
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
