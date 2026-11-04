import React, { createContext, useContext, useState, useEffect } from 'react';

const OfficeContext = createContext(null);

export function OfficeProvider({ children }) {
  const [selectedOffice, setSelectedOffice] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selected_office')) || null; } catch { return null; }
  });

  useEffect(() => {
    if (selectedOffice) localStorage.setItem('selected_office', JSON.stringify(selectedOffice));
    else localStorage.removeItem('selected_office');
  }, [selectedOffice]);

  return <OfficeContext.Provider value={{ selectedOffice, setSelectedOffice }}>{children}</OfficeContext.Provider>;
}

export const useOffice = () => useContext(OfficeContext);
