import { useState } from 'react';
import { QuoteRequest, updateQuoteRequestStatus, deleteQuoteRequest } from '../services/quoteRequestService';
import { generateAIResponse } from '../services/aiResponseService';
import { exportToPDF, printQuoteRequest } from '../components/admin/quoteRequests';

interface UseQuoteRequestActionsResult {
  handleUpdateStatus: (id: string, status: string) => Promise<void>;
  handleDeleteRequest: (id: string) => Promise<void>;
  handleGenerateResponse: () => Promise<void>;
  handleExportPDF: () => Promise<void>;
  handlePrint: () => void;
  generatingResponse: boolean;
  suggestedResponse: string;
  setSuggestedResponse: (response: string) => void;
  feedbackMessage: { type: 'success' | 'error', text: string } | null;
  setFeedbackMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
  error: string;
}

export const useQuoteRequestActions = (
  quoteRequests: QuoteRequest[],
  setQuoteRequests: React.Dispatch<React.SetStateAction<QuoteRequest[]>>,
  selectedRequest: QuoteRequest | null,
  setSelectedRequest: React.Dispatch<React.SetStateAction<QuoteRequest | null>>
): UseQuoteRequestActionsResult => {
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [error, setError] = useState<string>('');

  // Mise à jour du statut d'une demande
  const handleUpdateStatus = async (id: string, status: string) => {
    setFeedbackMessage(null); // Effacer les messages précédents
    setError('');
    try {
      const { error: updateError } = await updateQuoteRequestStatus(id, status);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setQuoteRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, status } : req
        )
      );

      // Mettre à jour la demande sélectionnée si c'est celle qui est modifiée
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(prev => prev ? { ...prev, status } : null);
      }

      setFeedbackMessage({ type: 'success', text: 'Statut mis à jour avec succès.' });
      // Effacer le message après quelques secondes
      setTimeout(() => setFeedbackMessage(null), 3000);

    } catch (err: any) {
      const errorMessage = `Erreur lors de la mise à jour du statut: ${err.message}`;
      setError(errorMessage);
      setFeedbackMessage({ type: 'error', text: errorMessage });
      console.error(err);
    }
  };

  // Suppression d'une demande
  const handleDeleteRequest = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de devis ? Cette action est irréversible.')) {
      return;
    }

    setFeedbackMessage(null); // Effacer les messages précédents
    setError('');
    try {
      const { error: deleteError } = await deleteQuoteRequest(id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Mettre à jour l'état local en supprimant la demande
      setQuoteRequests(prevRequests => 
        prevRequests.filter(req => req.id !== id)
      );

      // Si la demande sélectionnée est celle qui est supprimée, effacer la sélection
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
        setSuggestedResponse('');
      }

      setFeedbackMessage({ type: 'success', text: 'Demande de devis supprimée avec succès.' });
      // Effacer le message après quelques secondes
      setTimeout(() => setFeedbackMessage(null), 3000);

    } catch (err: any) {
      const errorMessage = `Erreur lors de la suppression: ${err.message}`;
      setError(errorMessage);
      setFeedbackMessage({ type: 'error', text: errorMessage });
      console.error(err);
    }
  };

  // Génération de réponse IA
  const handleGenerateResponse = async () => {
    if (!selectedRequest) {
      setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée.' });
      return;
    }

    console.log("Début de la génération de réponse AI...");
    setGeneratingResponse(true);
    setFeedbackMessage(null);
    setSuggestedResponse('');
    setError('');

    try {
      const { response, error } = await generateAIResponse(selectedRequest);
      
      if (error) {
        throw new Error(error);
      }

      if (response) {
        setSuggestedResponse(response);
        setFeedbackMessage({ type: 'success', text: 'Réponse IA générée avec succès.' });
      }
    } catch (err: any) {
      console.error('Erreur détaillée lors de la génération de la réponse IA:', err);
      const errorMessage = `Erreur lors de la génération IA: ${err.message}`;
      setFeedbackMessage({ type: 'error', text: errorMessage });
      setError(errorMessage);
    } finally {
      setGeneratingResponse(false);
      console.log("Fin de la génération de réponse AI.");
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!selectedRequest) {
      setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée pour l\'export.' });
      return;
    }

    try {
      await exportToPDF(selectedRequest, setFeedbackMessage);
    } catch (err: any) {
      console.error('Erreur lors de l\'export PDF:', err);
      setFeedbackMessage({ type: 'error', text: `Erreur lors de l'export PDF: ${err.message}` });
    }
  };

  // Impression
  const handlePrint = () => {
    if (!selectedRequest) {
      setFeedbackMessage({ type: 'error', text: 'Aucune demande sélectionnée pour l\'impression.' });
      return;
    }

    try {
      printQuoteRequest(selectedRequest);
    } catch (err: any) {
      console.error('Erreur lors de l\'impression:', err);
      setFeedbackMessage({ type: 'error', text: `Erreur lors de l'impression: ${err.message}` });
    }
  };

  return {
    handleUpdateStatus,
    handleDeleteRequest,
    handleGenerateResponse,
    handleExportPDF,
    handlePrint,
    generatingResponse,
    suggestedResponse,
    setSuggestedResponse,
    feedbackMessage,
    setFeedbackMessage,
    error
  };
};