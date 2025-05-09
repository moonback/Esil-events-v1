import React from 'react';
import { Brain, AlertTriangle, Tag, BarChart3, FileText, MessageSquare } from 'lucide-react';
import { QuoteRequestAnalysis } from '../../../services/quoteRequestAnalysisService';

interface QuoteRequestAnalysisProps {
  analysis: QuoteRequestAnalysis | null;
  loading: boolean;
  error?: string;
}

const QuoteRequestAnalysisComponent: React.FC<QuoteRequestAnalysisProps> = ({ 
  analysis, 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" /> Analyse IA en cours...
        </h3>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white rounded-xl border border-red-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" /> Erreur d'analyse
        </h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" /> Analyse IA
        </h3>
        <p className="text-sm text-gray-600">Aucune analyse disponible pour cette demande.</p>
      </div>
    );
  }

  // Fonction pour afficher le niveau d'urgence avec une couleur appropriée
  const renderUrgencyLevel = (level: number) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    const labels = {
      1: 'Très faible',
      2: 'Faible',
      3: 'Moyenne',
      4: 'Élevée',
      5: 'Très élevée'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  // Fonction pour afficher le score de lead avec une couleur appropriée
  const renderLeadScore = (score: number) => {
    let color = 'bg-gray-100 text-gray-800';
    
    if (score >= 8) color = 'bg-green-100 text-green-800';
    else if (score >= 6) color = 'bg-blue-100 text-blue-800';
    else if (score >= 4) color = 'bg-yellow-100 text-yellow-800';
    else if (score >= 2) color = 'bg-orange-100 text-orange-800';
    else color = 'bg-red-100 text-red-800';
    
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {score}/10
        </span>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 4 ? 'bg-yellow-500' : score >= 2 ? 'bg-orange-500' : 'bg-red-500'}`}
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-indigo-600" /> Analyse IA
      </h3>
      
      <div className="grid grid-cols-1 gap-y-4 text-sm">
        {/* Résumé */}
        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <span className="text-gray-700 font-medium flex items-center gap-1 mb-1">
            <FileText className="h-4 w-4" /> Résumé
          </span>
          <p className="text-gray-800">{analysis.summary}</p>
        </div>
        
        {/* Type d'événement et Urgence */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 block mb-1">Type d'événement</span>
            <span className="font-medium text-gray-900">{analysis.eventType}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600 block mb-1">Niveau d'urgence</span>
            {renderUrgencyLevel(analysis.urgencyLevel)}
          </div>
        </div>
        
        {/* Score de lead */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600 block mb-1 flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Score de lead
          </span>
          <div className="flex flex-col gap-2">
            {renderLeadScore(analysis.leadScore)}
            <p className="text-xs text-gray-600 mt-1">{analysis.leadScoreExplanation}</p>
          </div>
        </div>
        
        {/* Tags suggérés */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600 block mb-2 flex items-center gap-1">
            <Tag className="h-4 w-4" /> Tags suggérés
          </span>
          <div className="flex flex-wrap gap-2">
            {analysis.suggestedTags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
            {analysis.suggestedTags.length === 0 && (
              <span className="text-gray-500 text-xs">Aucun tag suggéré</span>
            )}
          </div>
        </div>
        
        {/* Besoins spécifiques */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600 block mb-2">Besoins spécifiques</span>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {analysis.specificNeeds.map((need, index) => (
              <li key={index}>{need}</li>
            ))}
            {analysis.specificNeeds.length === 0 && (
              <span className="text-gray-500 text-xs">Aucun besoin spécifique identifié</span>
            )}
          </ul>
        </div>
        
        {/* Commentaires IA */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600 block mb-1 flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> Commentaires IA
          </span>
          <p className="text-gray-700">{analysis.aiComments}</p>
        </div>
      </div>
    </div>
  );
};

export { QuoteRequestAnalysisComponent };