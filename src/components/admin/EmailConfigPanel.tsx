import React, { useState, useEffect } from 'react';
import { Mail, Save, Check } from 'lucide-react';
import { emailConfig } from '../../services/emailService';

interface EmailConfigPanelProps {
  onClose?: () => void;
}

const EmailConfigPanel: React.FC<EmailConfigPanelProps> = ({ onClose }) => {
  const [recipient, setRecipient] = useState(emailConfig.defaultRecipient);
  const [autoSend, setAutoSend] = useState(emailConfig.autoSendEnabled);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  useEffect(() => {
    // Charger la configuration au montage du composant
    const config = emailConfig.loadConfig();
    setRecipient(config.defaultRecipient);
    setAutoSend(config.autoSendEnabled);
  }, []);

  const handleSave = () => {
    try {
      // Valider l'adresse email
      if (!recipient || !recipient.includes('@')) {
        setSaveStatus({ 
          type: 'error', 
          message: 'Veuillez entrer une adresse email valide' 
        });
        return;
      }

      // Sauvegarder la configuration
      emailConfig.setSendConfig({
        recipient,
        autoSend
      });

      setSaveStatus({ 
        type: 'success', 
        message: 'Configuration enregistrée avec succès' 
      });

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
        if (onClose) onClose();
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Erreur lors de la sauvegarde de la configuration' 
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-600" />
          Configuration des emails automatiques
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email de réception
          </label>
          <input
            type="email"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="votre.email@orange.fr"
          />
          <p className="mt-1 text-xs text-gray-500">
            Les récapitulatifs de demandes de devis seront envoyés à cette adresse.
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoSend"
            checked={autoSend}
            onChange={(e) => setAutoSend(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="autoSend" className="ml-2 block text-sm text-gray-700">
            Activer l'envoi automatique d'emails
          </label>
        </div>

        {saveStatus.type && (
          <div className={`p-3 rounded-md text-sm ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {saveStatus.type === 'success' ? (
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {saveStatus.message}
              </div>
            ) : (
              saveStatus.message
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigPanel;