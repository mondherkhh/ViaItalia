import { useState, useEffect } from 'react';
import contractService from "../../../api/contractService";
export const useContracts = (userId) => {
  const [contractStatus, setContractStatus] = useState('PENDING');
  const [uploadedContract, setUploadedContract] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contractFile, setContractFile] = useState(null);
  const [error, setError] = useState(null);

  const fetchContractStatus = async () => {
    if (!userId) return;
    
    try {
      const response = await contractService.getContractByUserId(userId);
      if (response.success && response.data) {
        setContractStatus(response.data.status);
        setUploadedContract(response.data);
      }
    } catch (err) {
      console.error('Error fetching contract status:', err);
      setError('Erreur lors de la récupération du statut du contrat');
    }
  };

  const uploadContract = async (file) => {
    if (!userId || !file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('contract', file);

      const response = await contractService.uploadContract(formData);
      
      if (response.success) {
        setContractStatus('UPLOADED');
        setUploadedContract(response.data);
        setContractFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('contract-file-input');
        if (fileInput) {
          fileInput.value = '';
        }
        
        return response.data;
      }
    } catch (err) {
      console.error('Error uploading contract:', err);
      
      // Handle specific error for existing contract
      if (err.response?.status === 400 && 
          err.response?.data?.message?.includes('déjà téléversé')) {
        setError('Vous avez déjà téléversé un contrat');
      } else {
        setError('Erreur lors du téléversement du contrat');
      }
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleContractFileChange = (file) => {
    if (file && file.type === 'application/pdf') {
      setContractFile(file);
      setError(null);
    } else {
      setContractFile(null);
      setError('Veuillez sélectionner un fichier PDF');
    }
  };

  const clearContractFile = () => {
    setContractFile(null);
    setError(null);
  };

  const resetContractStatus = () => {
    setContractStatus('PENDING');
    setUploadedContract(null);
    setContractFile(null);
    setUploadProgress(0);
    setError(null);
  };

  useEffect(() => {
    fetchContractStatus();
  }, [userId]);

  return {
    contractStatus,
    uploadedContract,
    isUploading,
    uploadProgress,
    contractFile,
    error,
    fetchContractStatus,
    uploadContract,
    setContractFile,
    handleContractFileChange,
    clearContractFile,
    resetContractStatus
  };
};
