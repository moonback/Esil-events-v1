import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-32">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mentions Légales
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-8">
          {/* Éditeur du site */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Éditeur du Site
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le site [Nom du Site] est édité par [Nom de la société], société [forme juridique] au capital de [montant] euros, immatriculée au Registre du Commerce et des Sociétés de [ville] sous le numéro [numéro RCS], dont le siège social est situé à [adresse complète].
            </p>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Directeur de la Publication
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le directeur de la publication est [Nom et Prénom], en qualité de [fonction].
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Hébergement
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le site est hébergé par [Nom de l'hébergeur], [forme juridique], dont le siège social est situé [adresse complète de l'hébergeur].
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Propriété Intellectuelle
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              L'ensemble des éléments constituant le site (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, etc.) ainsi que le site lui-même, relèvent des lois françaises et internationales sur le droit d'auteur et la propriété intellectuelle. Ces éléments sont la propriété exclusive de [Nom de la société].
            </p>
          </section>

          {/* Données personnelles */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Protection des Données Personnelles
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée, et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité des données vous concernant.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez nous contacter à l'adresse email suivante : [adresse email de contact].
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Le site [Nom du Site] peut utiliser des cookies pour améliorer l'expérience utilisateur. Vous pouvez désactiver l'utilisation de cookies en modifiant les paramètres de votre navigateur. Pour en savoir plus sur notre politique en matière de cookies, veuillez consulter notre page dédiée.
            </p>
          </section>

          {/* Loi applicable */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Loi Applicable et Juridiction
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront compétents.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Pour toute question concernant nos mentions légales, n'hésitez pas à nous contacter.
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

export default TermsPage;
