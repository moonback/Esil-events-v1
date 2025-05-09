import React, { useState } from 'react';
import { FileText, Mail, Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import { QuoteRequest } from '../../../services/quoteRequestService';
import { generateAndSendQuoteEmail, QuoteGenerationOptions } from '../../../services/quoteEmailService';

interface QuoteEmailGeneratorProps {
  selectedRequest: QuoteRequest | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const QuoteEmailGenerator: React.FC<QuoteEmailGeneratorProps> = ({
  selectedRequest,
  onSuccess,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<QuoteGenerationOptions>({
    includePromotion: true,
    promotionDetails: '5% de remise pour toute confirmation dans les 7 jours',
    validityPeriod: 30
  });
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleGenerateAndSendQuote = async () => {
    if (!selectedRequest?.id) {
      setResult({
        success: false,
        message: 'Aucune demande de devis sélectionnée'
      });
      if (onError) onError('Aucune demande de devis sélectionnée');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await generateAndSendQuoteEmail(selectedRequest.id, options);

      if (response.success && response.emailSent) {
        setResult({
          success: true,
          message: 'Devis généré et envoyé avec succès'
        });
        if (onSuccess) onSuccess();
      } else {
        setResult({
          success: false,
          message: response.error || 'Échec de l\'envoi du devis'
        });
        if (onError) onError(response.error || 'Échec de l\'envoi du devis');
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Une erreur est survenue'
      });
      if (onError) onError(error.message || 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!selectedRequest) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" /> Génération de Devis
        </h3>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">Générer et envoyer un devis formel</p>
            <p className="text-xs text-gray-600 mt-1">
              Cette action va générer un devis basé sur les données actuelles des produits et l'envoyer par email au client ({selectedRequest.email}).
            </p>
          </div>
        </div>
      </div>

      {/* Options de génération */}
      <div className="flex justify-end">
        <button
          onClick={toggleOptions}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
        >
          {showOptions ? 'Masquer options' : 'Afficher options'}
        </button>
      </div>

      {showOptions && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="includePromotion"
                name="includePromotion"
                checked={options.includePromotion}
                onChange={handleOptionChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includePromotion" className="ml-2 block text-sm text-gray-700">
                Inclure une promotion
              </label>
            </div>
            {options.includePromotion && (
              <div className="ml-6">
                <label htmlFor="promotionDetails" className="block text-xs text-gray-600 mb-1">
                  Détails de la promotion
                </label>
                <input
                  type="text"
                  id="promotionDetails"
                  name="promotionDetails"
                  value={options.promotionDetails}
                  onChange={handleOptionChange}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="validityPeriod" className="block text-sm text-gray-700 mb-1">
              Validité du devis (jours)
            </label>
            <select
              id="validityPeriod"
              name="validityPeriod"
              value={options.validityPeriod}
              onChange={handleOptionChange}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={15}>15 jours</option>
              <option value={30}>30 jours</option>
              <option value={45}>45 jours</option>
              <option value={60}>60 jours</option>
            </select>
          </div>

          <div>
            <label htmlFor="additionalNotes" className="block text-sm text-gray-700 mb-1">
              Notes supplémentaires
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={options.additionalNotes || ''}
              onChange={handleOptionChange}
              rows={3}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Notes ou informations supplémentaires à inclure dans le devis..."
            />
          </div>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.success ? (
            <Check className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm">{result.message}</span>
        </div>
      )}

      {/* Bouton d'action */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerateAndSendQuote}
          disabled={isGenerating || !selectedRequest.email}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Générer & Envoyer Devis
            </>
          )}
        </button>
      </div>

      {!selectedRequest.email && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
          <AlertCircle className="h-4 w-4 inline-block mr-1" />
          L'email du client est manquant. Impossible d'envoyer le devis.
        </div>
      )}
    </div>
  );
};

export default QuoteEmailGenerator;