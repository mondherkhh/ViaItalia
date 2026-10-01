import { useState, useEffect } from 'react';
import universityService from '../../../api/universityInfoService';

export const useUniversityInfo = (userId) => {
  const [universityInfo, setUniversityInfo] = useState({
    university: '',
    specialty: '',
    level: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState(null);

  const fetchUniversityInfo = async () => {
    if (!userId) return;
    
    try {
      const response = await universityService.getUniversityByUserId(userId);
      if (response.success && response.data) {
        setUniversityInfo({
          university: response.data.university || '',
          specialty: response.data.specialty || '',
          level: response.data.level || ''
        });
        setIsConfirmed(response.data.isConfirmed || false);
      }
    } catch (err) {
      console.error('Error fetching university info:', err);
      setError('Erreur lors de la récupération des informations universitaires');
    }
  };

  const saveUniversityInfo = async (data) => {
    if (!userId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await universityService.saveUniversityInfo({
        ...data,
        userId
      });
      
      if (response.success && response.data) {
        setUniversityInfo({
          university: response.data.university,
          specialty: response.data.specialty,
          level: response.data.level
        });
        setIsConfirmed(response.data.isConfirmed);
        return response.data;
      }
    } catch (err) {
      console.error('Error saving university info:', err);
      setError('Erreur lors de la sauvegarde des informations universitaires');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateUniversityInfo = (field, value) => {
    setUniversityInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetUniversityInfo = () => {
    setUniversityInfo({
      university: '',
      specialty: '',
      level: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateUniversityInfo(name, value);
  };

  useEffect(() => {
    fetchUniversityInfo();
  }, [userId]);

  return {
    universityInfo,
    isSaving,
    isConfirmed,
    error,
    fetchUniversityInfo,
    saveUniversityInfo,
    updateUniversityInfo,
    resetUniversityInfo,
    handleInputChange
  };
};
