import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, AlertCircle, Mail, Download, Filter, RefreshCw, Send } from 'lucide-react';
import AdminLayout from '../../components/layouts/AdminLayout';
import AdminHeader from '../../components/admin/AdminHeader';
import { 
  NewsletterSubscription, 
  getAllSubscribers, 
  unsubscribeUser, 
  sendNewsletterToSubscribers 
} from '../../services/newsletterService';
import { generateNewsletterContent, NewsletterContentOptions } from '../../services/newsletterContentService';

const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<NewsletterSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // État pour le modal d'envoi de newsletter
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: '',
    testEmail: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // État pour les options de génération de contenu
  const [generationOptions, setGenerationOptions] = useState({
    theme: '',
    tone: 'friendly',
    includeProducts: true,
    contentLength: 'medium'
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [statusFilter, searchTerm, subscribers]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllSubscribers();
      if (error) throw new Error(error);
      if (data) {
        setSubscribers(data);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des abonnés:', err);
      setError('Impossible de charger les abonnés. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscribers = () => {
    let filtered = [...subscribers];
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredSubscribers(filtered);
  };

  const handleUnsubscribe = async (email: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir désabonner ${email} ?`)) {
      try {
        const { success, error } = await unsubscribeUser(email);
        if (!success) throw new Error(error);
        
        // Mettre à jour l'état local
        setSubscribers(prev => 
          prev.map(sub => 
            sub.email === email ? { ...sub, status: 'unsubscribed' } : sub
          )
        );
        
        showNotification('success', `L'abonné ${email} a été désabonné avec succès`);
      } catch (err) {
        console.error('Erreur lors du désabonnement:', err);
        showNotification('error', 'Une erreur est survenue lors du désabonnement');
      }
    }
  };

  const handleReactivate = async (email: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir réactiver l'abonnement de ${email} ?`)) {
      try {
        // Mettre à jour l'état local (la réactivation se fait via saveSubscriber qui n'est pas exposé directement)
        setSubscribers(prev => 
          prev.map(sub => 
            sub.email === email ? { ...sub, status: 'active' } : sub
          )
        );
        
        // Mettre à jour dans la base de données (en utilisant la fonction d'inscription qui réactive automatiquement)
        // Note: Ceci est une solution temporaire, idéalement il faudrait une fonction dédiée
        const response = await fetch('/api/newsletter/reactivate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (!response.ok) throw new Error('Erreur serveur');
        
        showNotification('success', `L'abonné ${email} a été réactivé avec succès`);
      } catch (err) {
        console.error('Erreur lors de la réactivation:', err);
        showNotification('error', 'Une erreur est survenue lors de la réactivation');
        // Annuler le changement local en cas d'erreur
        await fetchSubscribers();
      }
    }
  };

  const handleExportCSV = () => {
    // Créer le contenu CSV
    const headers = ['Email', 'Statut', 'Date d\'inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscribers.map(sub => {
        const date = sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '';
        return `${sub.email},${sub.status || ''},${date}`;
      })
    ].join('\n');
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateNewsletterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newsletterData.subject.trim()) {
      errors.subject = "Le sujet est requis";
    }
    
    if (!newsletterData.content.trim()) {
      errors.content = "Le contenu est requis";
    }
    
    // Valider l'email de test s'il est fourni
    if (newsletterData.testEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterData.testEmail)) {
      errors.testEmail = "L'adresse email de test n'est pas valide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendNewsletter = async (isTest: boolean = false) => {
    if (!validateNewsletterForm()) return;
    
    setIsSending(true);
    try {
      const result = await sendNewsletterToSubscribers(
        newsletterData.subject,
        newsletterData.content,
        isTest ? newsletterData.testEmail : undefined
      );
      
      if (!result.success) throw new Error(result.error);
      
      if (isTest) {
        showNotification('success', `Email de test envoyé avec succès à ${newsletterData.testEmail}`);
      } else {
        showNotification('success', `Newsletter envoyée avec succès à ${result.sentCount} abonnés`);
        handleCloseNewsletterModal();
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la newsletter:', err);
      showNotification('error', `Erreur lors de l'envoi: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseNewsletterModal = () => {
    setIsNewsletterModalOpen(false);
    setNewsletterData({
      subject: '',
      content: '',
      testEmail: ''
    });
    setFormErrors({});
    setIsPreviewMode(false);
  };
  
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  // Fonction pour générer du contenu HTML via Gemini
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    try {
      // Préparer les options pour la génération de contenu
      const options: NewsletterContentOptions = {
        theme: generationOptions.theme,
        tone: generationOptions.tone as 'formal' | 'friendly' | 'promotional',
        includeProducts: generationOptions.includeProducts,
        contentLength: generationOptions.contentLength as 'short' | 'medium' | 'long',
      };
      
      // Appeler le service de génération de contenu
      const result = await generateNewsletterContent(options);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.content) {
        // Mettre à jour le champ de contenu avec le HTML généré
        setNewsletterData(prev => ({
          ...prev,
          content: result.content || ''
        }));
        
        showNotification('success', 'Contenu HTML généré avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de la génération du contenu:', err);
      showNotification('error', `Erreur lors de la génération: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  return (
    <AdminLayout>
      <AdminHeader />
      <div className="p-6 md:p-14">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-12 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Gestion de la newsletter</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setIsNewsletterModalOpen(true)}
              className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 md:space-x-3 font-medium"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              <span>Envoyer une newsletter</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2 md:space-x-3 font-medium"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              <span>Exporter (CSV)</span>
            </button>
          </div>
        </div>
        
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Filtres */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrer par statut:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-full ${
                statusFilter === 'all' 
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-sm rounded-full ${
                statusFilter === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setStatusFilter('unsubscribed')}
              className={`px-3 py-1.5 text-sm rounded-full ${
                statusFilter === 'unsubscribed' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Désabonnés
            </button>
          </div>
          
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchSubscribers}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des abonnés</h3>
              <div className="p-2 bg-violet-100 dark:bg-violet-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{subscribers.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Abonnés actifs</h3>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
              {subscribers.filter(sub => sub.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Désabonnés</h3>
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Mail className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
              {subscribers.filter(sub => sub.status === 'unsubscribed').length}
            </p>
          </div>
        </div>
        
        {/* Tableau des abonnés */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aucun abonné trouvé
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {subscriber.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscriber.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {subscriber.status === 'active' ? 'Actif' : 'Désabonné'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subscriber.created_at 
                          ? new Date(subscriber.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {subscriber.status === 'active' ? (
                          <button
                            onClick={() => handleUnsubscribe(subscriber.email)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 mr-3"
                          >
                            Désabonner
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(subscriber.email)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                          >
                            Réactiver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal d'envoi de newsletter */}
      {isNewsletterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Envoyer une newsletter</h2>
                <button 
                  onClick={handleCloseNewsletterModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Onglets Édition/Aperçu */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                  <button
                    onClick={() => setIsPreviewMode(false)}
                    className={`py-2 px-4 font-medium text-sm ${!isPreviewMode 
                      ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                  >
                    Édition
                  </button>
                  <button
                    onClick={() => setIsPreviewMode(true)}
                    className={`py-2 px-4 font-medium text-sm ${isPreviewMode 
                      ? 'text-violet-600 border-b-2 border-violet-600 dark:text-violet-400 dark:border-violet-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                  >
                    Aperçu
                  </button>
                </div>
                
                {!isPreviewMode ? (
                  /* Mode Édition */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
                      <input
                        type="text"
                        value={newsletterData.subject}
                        onChange={(e) => setNewsletterData({...newsletterData, subject: e.target.value})}
                        className={`w-full px-4 py-2 border ${formErrors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                        placeholder="Ex: Nouvelles offres spéciales ESIL Events"
                      />
                      {formErrors.subject && <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu HTML *</label>
                      <textarea
                        value={newsletterData.content}
                        onChange={(e) => setNewsletterData({...newsletterData, content: e.target.value})}
                        rows={12}
                        className={`w-full px-4 py-2 border ${formErrors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm`}
                        placeholder="Entrez le contenu HTML de votre newsletter..."
                      />
                      {formErrors.content && <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>}
                    </div>
                    
                    {/* Options de génération de contenu */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Générer du contenu avec l'IA</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Thème</label>
                          <input
                            type="text"
                            value={generationOptions.theme}
                            onChange={(e) => setGenerationOptions({...generationOptions, theme: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                            placeholder="Ex: Événements d'été, Offres spéciales..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ton</label>
                          <select
                            value={generationOptions.tone}
                            onChange={(e) => setGenerationOptions({...generationOptions, tone: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="friendly">Amical</option>
                            <option value="formal">Formel</option>
                            <option value="promotional">Promotionnel</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Longueur</label>
                          <select
                            value={generationOptions.contentLength}
                            onChange={(e) => setGenerationOptions({...generationOptions, contentLength: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="short">Court</option>
                            <option value="medium">Moyen</option>
                            <option value="long">Long</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="includeProducts"
                            checked={generationOptions.includeProducts}
                            onChange={(e) => setGenerationOptions({...generationOptions, includeProducts: e.target.checked})}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                          />
                          <label htmlFor="includeProducts" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                            Inclure des produits/services
                          </label>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleGenerateContent}
                        disabled={isGenerating}
                        className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Génération en cours...</span>
                          </>
                        ) : (
                          <>
                            <span>Générer du contenu HTML</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Email de test */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de test (optionnel)</label>
                      <input
                        type="email"
                        value={newsletterData.testEmail}
                        onChange={(e) => setNewsletterData({...newsletterData, testEmail: e.target.value})}
                        className={`w-full px-4 py-2 border ${formErrors.testEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent dark:bg-gray-700 dark:text-white`}
                        placeholder="Entrez une adresse email pour tester l'envoi"
                      />
                      {formErrors.testEmail && <p className="mt-1 text-sm text-red-500">{formErrors.testEmail}</p>}
                    </div>
                  </div>
                ) : (
                  /* Mode Aperçu */
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu du sujet</h3>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                        <p className="font-medium">{newsletterData.subject || "(Aucun sujet défini)"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu du contenu</h3>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <div className="p-1">
                          {newsletterData.content ? (
                            <iframe 
                              srcDoc={newsletterData.content}
                              title="Aperçu de la newsletter"
                              className="w-full min-h-[500px] border-0"
                              sandbox="allow-same-origin"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-[500px] text-gray-500 dark:text-gray-400">
                              <p>Aucun contenu à afficher</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleSendNewsletter(true)}
                    disabled={isSending || !newsletterData.testEmail}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending && newsletterData.testEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer un test</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleSendNewsletter(false)}
                    disabled={isSending}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending && !newsletterData.testEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer à tous les abonnés actifs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNewsletter;