import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Send } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { getSmtpConfig, updateSmtpConfig, sendEmail, SmtpConfig } from '../../services/emailService';

const EmailConfigPage: React.FC = () => {
  const [config, setConfig] = useState<Partial<SmtpConfig>>({
    host: '',
    port: 465,
    secure: true,
    auth: {
      user: '',
      pass: ''
    },
    from: ''
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Charger la configuration actuelle
  useEffect(() => {
    const currentConfig = getSmtpConfig();
    setConfig({
      host: currentConfig.host,
      port: currentConfig.port,
      secure: currentConfig.secure,
      auth: {
        user: currentConfig.auth.user,
        pass: ''
      },
      from: currentConfig.from
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('auth.')) {
      const authField = name.split('.')[1];
      setConfig(prev => {
        // Utiliser un objet avec les propriétés user et pass comme valeur par défaut pour prev.auth
        const prevAuth = prev.auth ?? { user: '', pass: '' };
        return {
          ...prev,
          auth: {
            ...prevAuth,
            [authField]: value
          }
        };
      });
    } else if (type === 'checkbox') {
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setConfig(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Mettre à jour la configuration SMTP
      updateSmtpConfig(config);
      setMessage({ type: 'success', text: 'Configuration SMTP mise à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration SMTP:', error);
      setMessage({ type: 'error', text: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}` });
    } finally {
      setLoading(false);
      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Veuillez saisir une adresse email de test' });
      return;
    }

    setTestLoading(true);
    setMessage(null);

    try {
      // Envoyer un email de test
      const result = await sendEmail(
        testEmail,
        'Test de configuration SMTP - ESIL Events',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">ESIL Events</h1>
            <p style="margin: 5px 0 0;">Test de configuration SMTP</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Email de test</h2>
            <p>Cet email confirme que votre configuration SMTP fonctionne correctement.</p>
            <p>Configuration utilisée :</p>
            <ul>
              <li><strong>Serveur :</strong> ${config.host}</li>
              <li><strong>Port :</strong> ${config.port}</li>
              <li><strong>Sécurisé :</strong> ${config.secure ? 'Oui' : 'Non'}</li>
              <li><strong>Utilisateur :</strong> ${config.auth?.user}</li>
              <li><strong>Expéditeur :</strong> ${config.from}</li>
            </ul>
          </div>
        </div>
        `
      );

      if (result.success) {
        setMessage({ type: 'success', text: 'Email de test envoyé avec succès' });
      } else {
        throw new Error(result.error?.message || 'Échec de l\'envoi de l\'email de test');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de test:', error);
      setMessage({ type: 'error', text: `Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}` });
    } finally {
      setTestLoading(false);
      // Effacer le message après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader title="Configuration Email" icon={<Send size={24} />} />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Paramètres SMTP</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serveur SMTP</label>
              <input
                type="text"
                name="host"
                value={config.host}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ex: neurocode.fr"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port SMTP</label>
              <input
                type="number"
                name="port"
                value={config.port}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ex: 465"
                required
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="secure"
                checked={config.secure}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Connexion sécurisée (SSL/TLS)</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email d'expédition</label>
              <input
                type="email"
                name="from"
                value={config.from}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ex: contact@neurocode.fr"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                name="auth.user"
                value={config.auth?.user || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ex: contact@neurocode.fr"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                name="auth.pass"
                value={config.auth?.pass || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mot de passe SMTP"
              />
              <p className="text-xs text-gray-500 mt-1">
                {config.auth?.pass ? 'Le mot de passe sera mis à jour' : 'Laissez vide pour conserver le mot de passe actuel'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 md:space-x-3 font-medium"
              disabled={loading}
            >
              {loading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tester la configuration</h2>
        
        <div className="flex items-end gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de test</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Adresse email pour le test"
            />
          </div>
          
          <button
            type="button"
            onClick={handleTestEmail}
            className="btn-secondary flex items-center h-10"
            disabled={testLoading}
          >
            {testLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Send size={18} className="mr-2" />}
            Envoyer un test
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmailConfigPage;