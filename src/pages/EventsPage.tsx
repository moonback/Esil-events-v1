import React from 'react';

export const EventsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom mx-auto max-w-6xl">
        <section className="mb-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">ESIL Events</h1>
            <h2 className="text-2xl font-medium text-gray-700">Votre partenaire pour des événements inoubliables</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-xl p-8 mb-16 transform hover:scale-[1.01] transition duration-300">
            <p className="text-lg mb-5 leading-relaxed text-gray-700">
              Chez ESIL Events, nous sommes bien plus qu'une simple agence événementielle. Nous sommes
              des <span className="font-semibold text-blue-600">créateurs d'expériences</span>, des architectes de moments mémorables, prêts à vous accompagner à
              chaque étape de l'organisation de vos événements.
            </p>
            <p className="text-lg mb-5 leading-relaxed text-gray-700">
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
          </div>
          
          {/* Improved image placeholder with gradient overlay */}
          <div className="w-full h-96 bg-gradient-to-r from-purple-600 to-blue-500 mb-16 rounded-xl overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-2xl font-bold">PHOTO D'ÉVÉNEMENT</p>
            </div>
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
        </section>
        
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Notre méthodologie</h2>
            <p className="text-xl text-gray-600 italic max-w-3xl mx-auto">
              Créer des événements exceptionnels n'est pas le fruit du hasard
            </p>
          </div>
          
          <p className="text-lg mb-8 text-gray-700 max-w-4xl mx-auto text-center">
            Chez ESIL Events, nous savons qu'un événement réussi commence bien avant le jour J.
            C'est pourquoi nous apportons une attention toute particulière à chaque étape, pour garantir une
            expérience exceptionnelle. Nous ne faisons pas que gérer des événements, nous les créons, nous les
            vivons, et surtout, nous les rendons inoubliables !
          </p>
          <p className="text-xl mb-12 italic font-medium text-center text-purple-600">
            Prêt à découvrir notre processus secret pour transformer vos idées en un événement dont on parlera
            longtemps ?
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-500 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-500 mb-6 mx-auto">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">La planification sur-mesure</h3>
              <h4 className="text-lg font-semibold mb-4 text-center text-blue-500">Où tout commence</h4>
              <p className="mb-4 text-gray-600">
                Avant de lancer la machine, on prend le temps de comprendre vos attentes et vos objectifs.
                L'idée ? Créer une stratégie claire, parfaitement alignée avec vos envies et l'univers de votre
                marque.
              </p>
              <p className="mb-4 text-gray-600">
                Nous discutons, nous brainstormons, nous rêvons ensemble… et surtout, nous sommes à votre
                écoute pour nous assurer qu'on saisit exactement ce que vous voulez. Parce qu'un événement, ce
                n'est pas qu'une simple occasion, c'est un moment unique qui doit refléter votre identité.
              </p>
              <p className="text-gray-600">
                Une fois cette étape validée, vous pouvez être sûr que chaque aspect sera conçu sur-mesure : du
                lieu à l'animation, tout est fait pour que votre événement soit une expérience marquante et fidèle à
                vos valeurs.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-purple-500 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-500 mb-6 mx-auto">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Création et fun</h3>
              <h4 className="text-lg font-semibold mb-4 text-center text-purple-500">Donnons vie à votre événement avec du Style !</h4>
              <p className="mb-4 text-gray-600">
                Une fois la planification en place, place à la création et à l'inspiration ! C'est le moment où nous
                mettons la main à la pâte pour que votre événement ait du panache, du caractère et surtout, du fun !
              </p>
              <p className="mb-4 text-gray-600">
                Chez ESIL Events, nous adorons sortir des sentiers battus. Nous ne nous contentons pas de mettre
                en place un événement, nous créons un univers unique autour de lui. Le fil rouge de votre
                événement devient l'âme qui le relie, que ce soit une thématique décalée, une expérience immersive
                ou un clin d'œil à votre secteur.
              </p>
              <p className="text-gray-600">
                Le storytelling devient notre arme secrète : nous savons comment captiver l'attention, susciter
                l'émotion, et surtout étonner vos invités. Entre vidéos créatives, installations artistiques,
                performances live et jeux interactifs, chaque détail sera pensé pour plonger vos convives dans une
                aventure mémorable.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-indigo-500 hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-500 mb-6 mx-auto">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center text-gray-800">Action, production et fun</h3>
              <h4 className="text-lg font-semibold mb-4 text-center text-indigo-500">C'est le grand show !</h4>
              <p className="mb-4 text-gray-600">
                Le grand jour approche… Pas de panique ! Une fois que la créativité a fait son travail, il est temps
                de passer à la production. Et là, c'est l'explosion de génie : repérage des lieux, choix du traiteur,
                installation des scènes, mise en place des animations (flippers, jeux vidéo, photobooth… vous
                l'imaginez, nous l'avons !).
              </p>
              <p className="text-gray-600">
                Mais ce n'est pas tout. Nous nous occupons aussi des détails techniques, des animations
                interactives, et de toute la scénographie pour que tout soit parfait. Vous pourrez vous concentrer sur
                ce qui compte vraiment : profiter de votre événement pendant que nous gérons le reste avec un
                sourire (même si nous avons parfois la tête dans les câbles et les projecteurs !).
              </p>
            </div>
          </div>
          
          {/* Enhanced carousel placeholder */}
          <div className="w-full rounded-xl overflow-hidden shadow-xl mb-16">
            <div className="w-full h-96 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 flex items-center justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-2xl font-bold mb-2">CARROUSEL DE PHOTOS</p>
                  <p className="text-lg">Découvrez nos réalisations</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black opacity-30"></div>
              
              {/* Placeholder controls */}
              <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition">
                <span className="sr-only">Previous</span>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition">
                <span className="sr-only">Next</span>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Placeholder indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                <button className="h-2 w-6 bg-white rounded-full"></button>
                <button className="h-2 w-2 bg-white bg-opacity-50 rounded-full"></button>
                <button className="h-2 w-2 bg-white bg-opacity-50 rounded-full"></button>
              </div>
            </div>
          </div>
        </section>
        
        <section className="mb-20">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-xl p-10">
            <h2 className="text-4xl font-bold mb-10 text-center text-gray-800">Pourquoi choisir <span className="text-blue-600">ESIL Events</span> ?</h2>
            <h3 className="text-2xl font-medium mb-10 text-center text-gray-600">Parce que nous ne sommes pas comme les autres !</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-blue-600">Planification sur-mesure</h4>
                  <p className="text-gray-600">
                    Pas de "formules pré-faites". Nous créons un événement qui
                    vous ressemble et qui dépasse vos attentes !
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-purple-600">Créativité sans limites</h4>
                  <p className="text-gray-600">
                    On aime repousser les frontières du possible pour rendre votre
                    événement inoubliable (et fun !).
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-green-600">Production sans failles</h4>
                  <p className="text-gray-600">
                    Pas de stress, tout est pris en charge de A à Z, et chaque détail est
                    vérifié pour que vous n'ayez qu'à profiter du moment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-red-600">Une équipe passionnée</h4>
                  <p className="text-gray-600">
                    Des pros du fun, du spectacle et du sérieux en même temps – une
                    équipe qui met tout son cœur pour garantir que votre événement soit au top.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-12 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#confettiGradient)" />
                <defs>
                  <linearGradient id="confettiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6 text-center">Ready to party ?</h2>
            <h3 className="text-2xl font-medium mb-8 text-center text-blue-200">Contactez-nous pour créer un événement de folie !</h3>
            
            <p className="text-lg mb-8 max-w-3xl mx-auto text-center">
              Envie de faire appel à une équipe qui transforme vos événements en moments magiques ? ESIL
              Events, c'est plus qu'une agence événementielle, c'est un partenaire pour réaliser vos rêves (les
              plus fous !).
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto text-center">
              Contactez-nous dès maintenant pour discuter de votre projet et voyons ensemble comment mettre
              le feu à votre prochain événement !
            </p>
            
            <div className="flex justify-center mb-12">
              <button className="bg-white text-blue-900 font-bold py-4 px-12 rounded-full hover:bg-blue-100 transition duration-300 shadow-lg transform hover:scale-105 flex items-center">
                <span>Contactez-nous</span>
                <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
            
            <p className="text-xl italic text-center font-light">
              ESIL Events – Là où les idées prennent vie et les événements deviennent légendaires.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};