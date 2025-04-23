import { motion } from 'framer-motion';
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
const AboutPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="pt-28 pb-20 bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-black text-white py-20 mb-16">
        <div className="container-custom mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Notre Histoire</h1>
          <p className="text-xl max-w-3xl mx-auto">
          Que ce soit pour la location de matériel technique, l'animation ludique
              d'événements ou l'organisation complète d'événements, nous mettons notre expertise au service de
              votre réussite.          </p>
        </div>
      </div>
      
      {/* Expertise Section */}
      <motion.section 
        className="mb-16 md:mb-24 relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl p-10 transition duration-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.h2 
          className="text-3xl font-bold mb-6 text-center text-gray-800"
          variants={fadeInUp}
        >
          Notre Expertise : <span className="text-violet-700">Louer, créer, éblouir !</span>
        </motion.h2>
        
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-4xl mx-auto mb-12"
          variants={fadeInUp}
        >
          Chez ESIL Events, nous offrons un large éventail de services pour répondre à tous vos besoins
          événementiels. Découvrez nos différentes activités qui font notre force :
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Service Cards */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            variants={fadeInUp}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <div className="h-56 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/black/white?text=Photo+Matériel+Événementiel" 
                alt="Matériel événementiel" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-violet-600">Location de matériel événementiel</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Nous proposons la location de matériel de sonorisation, d'éclairage, de scènes, de signalétique et
                plus encore. Que vous organisiez une soirée d'entreprise, un séminaire, une conférence ou un
                lancement de produit, nous vous aidons à choisir le matériel adapté à vos besoins.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Nos services incluent également la livraison, l'installation et la présence de techniciens spécialisés en son et
                lumière pour garantir la réussite de votre événement. Vous pouvez compter sur notre expertise pour
                faire de votre projet un véritable succès.
              </p>
            </div>
          </motion.div>

          {/* Service Card 2 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            variants={fadeInUp}
            whileHover={{ y: -5 }}
          >
            <div className="h-56 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/black/white?text=Photo+Jeux+Événementiels" 
                alt="Jeux pour événements" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-indigo-600">Location de jeux pour événements ludiques</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Pour des événements plus ludiques et interactifs, nous proposons une large gamme de jeux de type
                rétro et moderne : des arcades des années 80, des flippers, des tables de ping-pong, des paniers de
                basket, des jeux de coup de poing, des machines à pince et bien plus.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Ces animations sont idéales pour des fêtes d'entreprise, des salons ou des kermesses, et elles apportent une dimension
                conviviale et fun à vos événements.
              </p>
            </div>
          </motion.div>

          {/* Service Card 3 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            variants={fadeInUp}
            whileHover={{ y: -5 }}
          >
            <div className="h-56 overflow-hidden">
              <img 
                src="https://placehold.co/600x400/black/white?text=Photo+Organisation+Événements" 
                alt="Organisation d'événements" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-600">Organisation complète d'événements</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                En tant qu'agence événementielle, nous prenons en charge l'organisation complète de votre
                événement, de A à Z. Cela comprend la planification, la conception, l'organisation et la
                coordination de séminaires, conférences, lancements de produits ou tout autre type de
                manifestation.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Nous travaillons avec un large réseau de professionnels : artistes (magiciens, DJ,
                chanteurs, danseurs, comédiens), techniciens et prestataires pour créer des événements sur-mesure,
                à la hauteur de vos attentes.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        className="mb-16 md:mb-24 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div 
          className="bg-gradient-to-br from-white to-violet-50 rounded-2xl shadow-lg p-12"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800"
            variants={fadeInUp}
          >
            Pourquoi choisir <span className="text-violet-700">ESIL Events</span> ?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reason Cards */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start">
                <div className="bg-violet-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Expertise et expérience</h3>
                  <p className="text-gray-600">
                    Plus de 20 ans d'expérience dans la gestion technique et organisationnelle des événements.
                    Notre expertise fait de chaque événement un moment unique et inoubliable.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start">
                <div className="bg-violet-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Service sur-mesure</h3>
                  <p className="text-gray-600">
                    Des solutions personnalisées pour chaque client, adaptées à vos besoins spécifiques.
                    Un accompagnement complet pour garantir la qualité de service.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start">
                <div className="bg-violet-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Flexibilité et réactivité</h3>
                  <p className="text-gray-600">
                    Une équipe disponible et réactive pour répondre à vos demandes, même de dernière minute.
                    Des solutions adaptables selon vos besoins partout en France.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start">
                <div className="bg-violet-100 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Une équipe passionnée</h3>
                  <p className="text-gray-600">
                    Des professionnels dévoués qui travaillent ensemble pour faire de votre événement un succès.
                    Une expertise technique et créative au service de votre projet.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        className="w-full px-4 py-16 mb-20 bg-gradient-to-br from-white via-violet-50 to-white rounded-3xl shadow-lg"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >

        <div className="w-full ">
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
        </div>
      </motion.section>

      {/* Partners Section */}
      <motion.section 
        className="bg-gray-900 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-white">
            Ils ont choisi ESIL Events pour leurs événements
          </h2>
          
          <p className="text-lg text-gray-300 text-center max-w-4xl mx-auto mb-12">
            Nous avons eu le privilège de collaborer avec de nombreuses entreprises et institutions prestigieuses
            pour organiser des événements mémorables.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Partner logos - replace with actual partner logos */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 p-6 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                variants={fadeInUp}
              >
                <img 
                  src={`https://placehold.co/200x100/gray/white?text=Partner+${index}`} 
                  alt={`Partner ${index}`} 
                  className="max-h-16"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 py-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Rejoignez l'aventure ESIL Events
        </h2>
        <h3 className="text-2xl font-medium mb-8 text-gray-700 dark:text-gray-300">
          Transformons votre projet en succès
        </h3>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Vous avez un projet d'événement ? Que ce soit pour la location de matériel, l'animation de vos
          événements ou une gestion complète, ESIL Events est là pour vous accompagner à chaque étape.
          Contactez-nous dès aujourd'hui pour discuter de vos besoins, et ensemble, faisons de votre
          événement un moment inoubliable.
        </p>
        
        <motion.button 
          className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contactez-nous
        </motion.button>
      </motion.section>
    </div>
  );
};

export default AboutPage;
