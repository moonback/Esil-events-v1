import React, { useState, useEffect } from 'react';
import { BrainCircuit, Save, Check, X } from 'lucide-react';
import { deepseekConfig } from '../../services/deepseekService';

interface DeepseekConfigPanelProps {
  onClose?: () => void;
}

const DeepseekConfigPanel: React.FC<DeepseekConfigPanelProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('deepseek-chat');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [enabled, setEnabled] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  useEffect(() => {
    // Charger la configuration au montage du composant
    const config = deepseekConfig.loadConfig();
    setApiKey(config.apiKey);
    setModel(config.model);
    setTemperature(config.temperature);
    setMaxTokens(config.maxTokens);
    setEnabled(config.enabled);
  }, []);

  const handleSave = () => {
    try {
      // Valider la clé API si l'intégration est activée
      if (enabled && !apiKey) {
        setSaveStatus({ 
          type: 'error', 
          message: 'Veuillez entrer une clé API valide pour activer l\'intégration' 
        });
        return;
      }

      // Sauvegarder la configuration
      deepseekConfig.saveConfig({
        apiKey,
        model,
        temperature,
        maxTokens,
        enabled
      });

      setSaveStatus({ 
        type: 'success', 
        message: 'Configuration DeepSeek enregistrée avec succès' 
      });

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
        if (onClose) onClose();
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration DeepSeek:', error);
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
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          Configuration de l'IA DeepSeek
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
            Activer l'intégration DeepSeek AI
          </label>
        </div>

        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            Clé API DeepSeek
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="sk-..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Obtenez votre clé API sur <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">deepseek.com</a>
          </p>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-coder">DeepSeek Coder</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Température: {temperature}
          </label>
          <input
            type="range"
            id="temperature"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Précis</span>
            <span>Créatif</span>
          </div>
        </div>

        <div>
          <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
            Longueur maximale: {maxTokens} tokens
          </label>
          <input
            type="range"
            id="maxTokens"
            min="100"
            max="2000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {saveStatus.type && (
          <div className={`p-3 rounded-md text-sm ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {saveStatus.type === 'success' ? (
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {saveStatus.message}
              </div>
            ) : (
              <div className="flex items-center">
                <X className="w-4 h-4 mr-2" />
                {saveStatus.message}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeepseekConfigPanel;