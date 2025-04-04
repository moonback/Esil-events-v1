import React from 'react';

const teamMembers = [
  {
    id: 1,
    name: "Eric",
    role: "Fondateur et Responsable Technique",
    image: "/images/team1.jpg",
    description: "Depuis la création de ESIL Events en 2004, Eric est le garant de la qualité technique de vos événements. Expert en sonorisation et éclairage, il conseille chaque client sur le choix du matériel et veille à ce que chaque installation soit parfaitement réalisée. Eric supervise également l'équipe technique pour assurer le bon déroulement de toutes les prestations."
  },
  {
    id: 2,
    name: "Amélie",
    role: "Responsable Commerciale",
    image: "/images/team2.jpg",
    description: "Amélie est votre interlocutrice privilégiée pour toutes vos demandes commerciales. Elle est là pour vous aider à trouver les solutions qui correspondent à vos besoins et à votre budget. Grâce à son expertise commerciale et sa connaissance du secteur événementiel, Amélie vous accompagne tout au long de votre projet, de la demande de devis à la finalisation de votre événement."
  },
  {
    id: 3,
    name: "Virginie",
    role: "Chargée de Projets Événementiels",
    image: "/images/team3.jpg",
    description: "Virginie gère l'ensemble des projets événementiels, de leur conception à leur réalisation. Elle est en charge de la planification, de la coordination des équipes et de la gestion de tous les détails pour que votre événement soit un succès. Son rôle est de s'assurer que tout soit organisé dans les moindres détails, afin que vous puissiez vous concentrer sur l'essentiel."
  },
  {
    id: 4,
    name: "Équipe Technique",
    role: "Techniciens Événementiels",
    image: "/images/team4.jpg",
    description: "Nos techniciens événementiels, responsables de l'installation et du bon fonctionnement du matériel technique. De la sonorisation à l'éclairage, en passant par la mise en place des scènes, ils assurent un service irréprochable. Leur savoir-faire et leur professionnalisme garantissent une prestation sans accroc."
  }
];

const services = [
  {
    id: 1,
    title: "Location de matériel événementiel",
    image: "/images/equipment.jpg",
    icon: (
      <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Nous proposons la location de matériel de sonorisation, d'éclairage, de scènes, de signalétique et plus encore. Que vous organisiez une soirée d'entreprise, un séminaire, une conférence ou un lancement de produit, nous vous aidons à choisir le matériel adapté à vos besoins. Nos services incluent également la livraison, l'installation et la présence de techniciens spécialisés en son et lumière pour garantir la réussite de votre événement."
  },
  {
    id: 2,
    title: "Location de jeux pour événements ludiques",
    image: "/images/games.jpg",
    icon: (
      <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description: "Pour des événements plus ludiques et interactifs, nous proposons une large gamme de jeux de type rétro et moderne : des arcades des années 80, des flippers, des tables de ping-pong, des paniers de basket, des jeux de coup de poing, des machines à pince et bien plus. Ces animations sont idéales pour des fêtes d'entreprise, des salons ou des kermesses, et elles apportent une dimension conviviale et fun à vos événements."
  },
  {
    id: 3,
    title: "Organisation complète d'événements",
    image: "/images/events.jpg",
    icon: (
      <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    description: "En tant qu'agence événementielle, nous prenons en charge l'organisation complète de votre événement, de A à Z. Cela comprend la planification, la conception, l'organisation et la coordination de séminaires, conférences, lancements de produits ou tout autre type de manifestation. Nous travaillons avec un large réseau de professionnels : artistes (magiciens, DJ, chanteurs, danseurs, comédiens), techniciens et prestataires pour créer des événements sur-mesure, à la hauteur de vos attentes."
  }
];

const advantages = [
  {
    id: 1,
    title: "Expertise et expérience",
    icon: (
      <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Avec plus de 20 ans d'expérience, notre équipe possède une expertise solide dans la gestion technique et organisationnelle des événements. Nous savons ce qu'il faut pour rendre chaque événement unique, réussi et inoubliable."
  },
  {
    id: 2,
    title: "Service sur-mesure",
    icon: (
      <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    description: "Nous proposons des solutions personnalisées, adaptées aux besoins spécifiques de chaque client. Que ce soit pour la location de matériel, l'animation ou l'organisation complète, nous vous accompagnons à chaque étape pour garantir un service de qualité et sur-mesure."
  },
  {
    id: 3,
    title: "Flexibilité et réactivité",
    icon: (
      <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Nous comprenons que chaque événement est unique, c'est pourquoi nous restons flexibles et réactifs pour répondre à vos demandes, même de dernière minute. Notre équipe est disponible pour vous conseiller et vous accompagner partout en France."
  },
  {
    id: 4,
    title: "Une équipe dédiée à votre réussite",
    icon: (
      <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: "Chez ESIL Events, chaque membre de notre équipe est passionné par son métier. Que ce soit pour la gestion technique, l'accompagnement commercial ou la coordination d'événements, nous travaillons tous ensemble pour faire de votre événement un succès."
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
                ESIL Events
              </h1>
              <p className="mt-6 text-xl text-primary-100 max-w-3xl">
                Depuis 2004, ESIL Events est un acteur incontournable dans l'univers de l'événementiel.
                Fort de plus de 20 ans d'expérience, notre société accompagne les entreprises dans la gestion de
                leurs événements professionnels.
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
                  Nous proposons des solutions sur-mesure, un matériel de qualité et une équipe passionnée. 
                  Que ce soit pour la location de matériel technique, l'animation ludique d'événements 
                  ou l'organisation complète d'événements, nous mettons notre expertise au service de votre réussite.
                </p>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Notre Expertise : Louer, créer, éblouir !
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Chez ESIL Events, nous offrons un large éventail de services pour répondre à tous vos besoins
                  événementiels. Découvrez nos différentes activités qui font notre force.
                </p>
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

          {/* Nos Services */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Nos Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(service => (
                <div key={service.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                  <div className="relative h-48">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nos Avantages avec icônes */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Pourquoi choisir ESIL Events ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {advantages.map(advantage => (
                <div key={advantage.id} className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 p-8 rounded-xl shadow-lg">
                  <div className="flex items-center mb-4">
                    {advantage.icon}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{advantage.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Notre Équipe */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Rencontrez les visages de vos événements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="relative h-full md:col-span-1">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:col-span-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-4">{member.role}</p>
                      <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
                      <div className="flex space-x-4 mt-4">
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
                </div>
              ))}
            </div>
          </section>

          {/* Partenaires */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Ils ont choisi ESIL Events pour leurs événements
            </h2>
            <div className="bg-gray-900 p-8 rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex items-center justify-center">
                  <img src="/images/partner1.png" alt="Partenaire 1" className="h-16 filter grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="flex items-center justify-center">
                  <img src="/images/partner2.png" alt="Partenaire 2" className="h-16 filter grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="flex items-center justify-center">
                  <img src="/images/partner3.png" alt="Partenaire 3" className="h-16 filter grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="flex items-center justify-center">
                  <img src="/images/partner4.png" alt="Partenaire 4" className="h-16 filter grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Contact CTA amélioré */}
          <section className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-gray-800">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-black opacity-80"></div>
            <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Rejoignez l'aventure ESIL Events : Transformons votre projet en succès
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Vous avez un projet d'événement ? Que ce soit pour la location de matériel, l'animation de vos
                événements ou une gestion complète, ESIL Events est là pour vous accompagner à chaque étape.
                Contactez-nous dès aujourd'hui pour discuter de vos besoins, et ensemble, faisons de votre
                événement un moment inoubliable !
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Contactez-nous
                </a>
                <a
                  href="/catalogue"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
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