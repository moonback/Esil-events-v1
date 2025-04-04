import React from 'react';
import { motion } from 'framer-motion';

export const EventsPage: React.FC = () => {
  // Animation variants for scroll reveal effects
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } }
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
    <div className="pt-28 pb-20 px-4 bg-white dark:bg-gray-800 w-full">
      <div className="w-full">
        {/* Hero Section */}
        <motion.section 
          className="mb-16 md:mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-violet-900">ESIL Events</span>
            </h1>
            <h2 className="text-2xl font-medium text-gray-700 tracking-wide">Votre partenaire pour des événements inoubliables</h2>
          </div>
          
          <motion.div 
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-10 mb-20 transition duration-500"
            whileHover={{ scale: 1.01 }}
          >
            <p className="text-lg mb-6 leading-relaxed text-gray-700">
              Chez ESIL Events, nous sommes bien plus qu'une simple agence événementielle. Nous sommes
              des <span className="font-semibold text-violet-700">créateurs d'expériences</span>, des architectes de moments mémorables, prêts à vous accompagner à
              chaque étape de l'organisation de vos événements.
            </p>
            <p className="text-lg mb-6 leading-relaxed text-gray-700">
              Que ce soit pour des séminaires, des soirées
              d'entreprise, des lancements de produits, des salons professionnels ou des événements plus
              ludiques et interactifs, nous avons les compétences et la passion nécessaires pour transformer vos
              idées en réalité.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Notre rôle ? Vous guider et vous offrir une expérience sur-mesure, en prenant en charge la
              planification, la création, la production et l'exécution de votre projet événementiel. Grâce à notre
              expertise, à notre créativité et à notre réseau de partenaires, nous vous garantissons un événement
              sans accroc, où chaque détail est pensé pour offrir à vos invités une expérience unique. Avec ESIL
              Events, chaque événement devient un moment incontournable qui marquera les esprits, tout en
              respectant vos valeurs, vos objectifs et votre budget.
            </p>
          </motion.div>
          
          {/* Image placeholder with improved gradient */}
          <motion.div 
            className="w-full h-96 bg-gradient-to-r from-violet-900 via-violet-800 to-violet-700 mb-20 rounded-2xl overflow-hidden shadow-lg relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-pattern bg-opacity-10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-2xl font-bold tracking-wide">PHOTO D'ÉVÉNEMENT</p>
            </div>
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </motion.div>
        </motion.section>
        
        {/* Methodology Section */}
        <motion.section 
          className="mb-16 md:mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center">Notre méthodologie</h2>
            <p className="text-xl text-gray-600 italic max-w-3xl mx-auto">
              Créer des événements exceptionnels n'est pas le fruit du hasard
            </p>
          </div>
          
          <p className="text-lg mb-10 text-gray-700 max-w-4xl mx-auto text-center">
            Chez ESIL Events, nous savons qu'un événement réussi commence bien avant le jour J.
            C'est pourquoi nous apportons une attention toute particulière à chaque étape, pour garantir une
            expérience exceptionnelle. Nous ne faisons pas que gérer des événements, nous les créons, nous les
            vivons, et surtout, nous les rendons inoubliables !
          </p>
          <p className="text-xl mb-16 italic font-medium text-center text-indigo-700">
            Prêt à découvrir notre processus secret pour transformer vos idées en un événement dont on parlera
            longtemps ?
          </p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gradient-to-b from-blue-700 to-blue-900 transition-all duration-300 hover:shadow-xl"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-violet-50 text-violet-600 mb-8 mx-auto shadow-md">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">La planification sur-mesure</h3>
              <h4 className="text-lg font-semibold mb-5 text-center text-violet-600">Où tout commence</h4>
              <p className="mb-5 text-gray-600 leading-relaxed">
                Avant de lancer la machine, on prend le temps de comprendre vos attentes et vos objectifs.
                L'idée ? Créer une stratégie claire, parfaitement alignée avec vos envies et l'univers de votre
                marque.
              </p>
              <p className="mb-5 text-gray-600 leading-relaxed">
                Nous discutons, nous brainstormons, nous rêvons ensemble… et surtout, nous sommes à votre
                écoute pour nous assurer qu'on saisit exactement ce que vous voulez. Parce qu'un événement, ce
                n'est pas qu'une simple occasion, c'est un moment unique qui doit refléter votre identité.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Une fois cette étape validée, vous pouvez être sûr que chaque aspect sera conçu sur-mesure : du
                lieu à l'animation, tout est fait pour que votre événement soit une expérience marquante et fidèle à
                vos valeurs.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-indigo-600 transition duration-500"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 text-indigo-600 mb-8 mx-auto shadow-md">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Création et fun</h3>
              <h4 className="text-lg font-semibold mb-5 text-center text-indigo-600">Donnons vie à votre événement avec du Style !</h4>
              <p className="mb-5 text-gray-600 leading-relaxed">
                Une fois la planification en place, place à la création et à l'inspiration ! C'est le moment où nous
                mettons la main à la pâte pour que votre événement ait du panache, du caractère et surtout, du fun !
              </p>
              <p className="mb-5 text-gray-600 leading-relaxed">
                Chez ESIL Events, nous adorons sortir des sentiers battus. Nous ne nous contentons pas de mettre
                en place un événement, nous créons un univers unique autour de lui. Le fil rouge de votre
                événement devient l'âme qui le relie, que ce soit une thématique décalée, une expérience immersive
                ou un clin d'œil à votre secteur.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Le storytelling devient notre arme secrète : nous savons comment captiver l'attention, susciter
                l'émotion, et surtout étonner vos invités. Entre vidéos créatives, installations artistiques,
                performances live et jeux interactifs, chaque détail sera pensé pour plonger vos convives dans une
                aventure mémorable.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl shadow-md p-8 border-t-4 border-violet-800 transition duration-500"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-violet-50 text-violet-800 mb-8 mx-auto shadow-md">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Action, production et fun</h3>
              <h4 className="text-lg font-semibold mb-5 text-center text-violet-800">C'est le grand show !</h4>
              <p className="mb-5 text-gray-600 leading-relaxed">
                Le grand jour approche… Pas de panique ! Une fois que la créativité a fait son travail, il est temps
                de passer à la production. Et là, c'est l'explosion de génie : repérage des lieux, choix du traiteur,
                installation des scènes, mise en place des animations (flippers, jeux vidéo, photobooth… vous
                l'imaginez, nous l'avons !).
              </p>
              <p className="text-gray-600 leading-relaxed">
                Mais ce n'est pas tout. Nous nous occupons aussi des détails techniques, des animations
                interactives, et de toute la scénographie pour que tout soit parfait. Vous pourrez vous concentrer sur
                ce qui compte vraiment : profiter de votre événement pendant que nous gérons le reste avec un
                sourire (même si nous avons parfois la tête dans les câbles et les projecteurs !).
              </p>
            </motion.div>
          </motion.div>
          
          {/* Enhanced carousel placeholder */}
          <motion.div 
            className="w-full rounded-2xl overflow-hidden shadow-xl mb-20"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-96 bg-gradient-to-r from-violet-800 via-violet-700 to-violet-800 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-2xl font-bold mb-2">CARROUSEL DE PHOTOS</p>
                  <p className="text-lg">Découvrez nos réalisations</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-20"></div>
              
              {/* Placeholder controls with improved design */}
              <button className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition duration-300 shadow-lg">
                <span className="sr-only">Previous</span>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition duration-300 shadow-lg">
                <span className="sr-only">Next</span>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Placeholder indicators with improved design */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                <button className="h-2 w-8 bg-white rounded-full shadow-md"></button>
                <button className="h-2 w-2 bg-white bg-opacity-50 rounded-full shadow-md"></button>
                <button className="h-2 w-2 bg-white bg-opacity-50 rounded-full shadow-md"></button>
              </div>
            </div>
          </motion.div>
        </motion.section>
        
        {/* Why Choose Us Section */}
        <motion.section 
          className="mb-16 md:mb-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.div 
            className="bg-gradient-to-br from-white to-violet-50 rounded-2xl shadow-lg p-12"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">Pourquoi choisir <span className="text-violet-700">ESIL Events</span> ?</h2>
            <h3 className="text-2xl font-medium mb-12 text-center text-gray-600">Parce que nous ne sommes pas comme les autres !</h3>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
            >
              <motion.div 
                className="flex items-start p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0 mr-5">
                  <div className="h-14 w-14 rounded-full bg-violet-50 flex items-center justify-center shadow-sm">
                    <svg className="h-6 w-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-violet-700">Planification sur-mesure</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Pas de "formules pré-faites". Nous créons un événement qui
                    vous ressemble et qui dépasse vos attentes !
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0 mr-5">
                  <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center shadow-sm">
                    <svg className="h-6 w-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-indigo-700">Créativité sans limites</h4>
                  <p className="text-gray-600 leading-relaxed">
                    On aime repousser les frontières du possible pour rendre votre
                    événement inoubliable (et fun !).
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0 mr-5">
                  <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                    <svg className="h-6 w-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-green-700">Production sans failles</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Pas de stress, tout est pris en charge de A à Z, et chaque détail est
                    vérifié pour que vous n'ayez qu'à profiter du moment.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition duration-300"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-shrink-0 mr-5">
                  <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center shadow-sm">
                    <svg className="h-6 w-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 text-red-700">Une équipe passionnée</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Des pros du fun, du spectacle et du sérieux en même temps – une
                    équipe qui met tout son cœur pour garantir que votre événement soit au top.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
        
        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <motion.div 
            className="bg-gradient-to-r from-violet-700 to-violet-900 text-white p-12 rounded-xl shadow-2xl relative overflow-hidden"
            whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-pattern"></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#confettiGradient)" />
                  <defs>
                    <linearGradient id="confettiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 text-center">Ready to party ?</h2>
              <h3 className="text-2xl font-medium mb-10 text-center text-blue-200">Contactez-nous pour créer un événement de folie !</h3>
              
              <p className="text-lg mb-8 max-w-3xl mx-auto text-center leading-relaxed">
                Envie de faire appel à une équipe qui transforme vos événements en moments magiques ? ESIL
                Events, c'est plus qu'une agence événementielle, c'est un partenaire pour réaliser vos rêves (les
                plus fous !).
              </p>
              <p className="text-lg mb-16 max-w-3xl mx-auto text-center leading-relaxed">
                Contactez-nous dès maintenant pour discuter de votre projet et voyons ensemble comment mettre
                le feu à votre prochain événement !
              </p>
              
              <div className="flex justify-center mb-16">
                <motion.button 
                  className="bg-white text-violet-900 font-bold py-4 px-12 rounded-full hover:bg-violet-50 transition duration-300 shadow-lg flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Contactez-nous</span>
                  <svg className="h-5 w-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </motion.button>
              </div>
              
              <p className="text-xl italic text-center font-light tracking-wide">
                ESIL Events – Là où les idées prennent vie et les événements deviennent légendaires.
              </p>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};