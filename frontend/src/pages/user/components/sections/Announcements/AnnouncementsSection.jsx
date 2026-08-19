import React, { useState, useEffect, useRef } from 'react';
import AnnouncementCard from '../../../../../components/AnnouncementCard';
import { useAnnouncements } from '../../../hooks/useAnnouncements';
import {
  AnnouncementsContainer,
  AnnouncementsHeader,
  AnnouncementsTitle,
  AnnouncementsSubtitle,
  AnnouncementsGrid,
  FilterContainer,
  FilterButton,
  FilterDropdown,
  LoadingContainer,
  EmptyState,
  ErrorMessage
} from './Announcements.styles';

const AnnouncementsSection = () => {
  // Hide all scrollbars completely
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all scrollbars completely */
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Force hide any remaining scrollbars */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const { 
    announcements, 
    isLoading, 
    error, 
    getAnnouncementType, 
    getLatestAnnouncements,
    getAnnouncementsByType 
  } = useAnnouncements();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState(6);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filters = [
    { id: 'all', label: 'Toutes', icon: '📢' },
    { id: 'INFO', label: 'Informations', icon: 'ℹ️' },
    { id: 'SUCCESS', label: 'Succès', icon: '✅' },
    { id: 'WARNING', label: 'Attention', icon: '⚠️' },
    { id: 'URGENT', label: 'Urgent', icon: '🔴' },
    { id: 'ACADEMIQUE', label: 'Académique', icon: '🎓' }
  ];

  const getFilteredAnnouncements = () => {
    if (activeFilter === 'all') {
      return getLatestAnnouncements(displayedAnnouncements);
    }
    return getAnnouncementsByType(activeFilter).slice(0, displayedAnnouncements);
  };

  const handleLoadMore = () => {
    setDisplayedAnnouncements(prev => prev + 3);
  };

  const handleLike = (announcementId) => {
    console.log('Liked announcement:', announcementId);
    // TODO: Implement like functionality
  };

  const handleComment = (announcementId) => {
    console.log('Comment on announcement:', announcementId);
    // TODO: Implement comment functionality
  };

  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilterData = filters.find(f => f.id === activeFilter);

  if (isLoading) {
    return (
      <AnnouncementsContainer>
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Chargement des annonces...</p>
        </LoadingContainer>
      </AnnouncementsContainer>
    );
  }

  if (error) {
    return (
      <AnnouncementsContainer>
        <ErrorMessage>
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </ErrorMessage>
      </AnnouncementsContainer>
    );
  }

  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <AnnouncementsContainer style={{ overflow: 'hidden' }}>
      <AnnouncementsHeader>
        <AnnouncementsTitle>
        
          Annonces
        </AnnouncementsTitle>
        <AnnouncementsSubtitle>
          Restez informé des dernières nouvelles et mises à jour importantes
        </AnnouncementsSubtitle>
      </AnnouncementsHeader>

      {/* Filters - Desktop: all visible, Mobile: dropdown */}
      <FilterContainer ref={dropdownRef}>
        {/* Desktop: Show all filters inline */}
        <div className="desktop-filters">
          {filters.map(filter => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              <span className="icon">{filter.icon}</span>
              <span className="label">{filter.label}</span>
              <span className="count">
                {filter.id === 'all' 
                  ? announcements.length 
                  : getAnnouncementsByType(filter.id).length
                }
              </span>
            </FilterButton>
          ))}
        </div>

        {/* Mobile: Dropdown style - show only active filter */}
        <div className="mobile-dropdown">
          {/* Active Filter Button (toggle) */}
          <FilterButton
            active={true}
            isDropdownToggle={true}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="icon">{activeFilterData?.icon}</span>
            <span className="label">{activeFilterData?.label}</span>
            <span className="count">
              {activeFilter === 'all' 
                ? announcements.length 
                : getAnnouncementsByType(activeFilter).length
              }
            </span>
            <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
          </FilterButton>

          {/* Dropdown Menu with all filters */}
          {isDropdownOpen && (
            <FilterDropdown>
              {filters.filter(f => f.id !== activeFilter).map(filter => (
                <FilterButton
                  key={filter.id}
                  active={false}
                  isDropdownItem={true}
                  onClick={() => handleFilterSelect(filter.id)}
                >
                  <span className="icon">{filter.icon}</span>
                  <span className="label">{filter.label}</span>
                  <span className="count">
                    {filter.id === 'all' 
                      ? announcements.length 
                      : getAnnouncementsByType(filter.id).length
                    }
                  </span>
                </FilterButton>
              ))}
            </FilterDropdown>
          )}
        </div>
      </FilterContainer>

      {/* Announcements Grid */}
      {filteredAnnouncements.length > 0 ? (
        <>
          <AnnouncementsGrid>
            {filteredAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                onLike={() => handleLike(announcement._id)}
                onComment={() => handleComment(announcement._id)}
              />
            ))}
          </AnnouncementsGrid>

          {/* Load More Button */}
          {filteredAnnouncements.length >= displayedAnnouncements && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button 
                onClick={handleLoadMore}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                }}
              >
                Charger plus d'annonces
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState>
          <div className="icon">📢</div>
          <h3>Aucune annonce disponible</h3>
          <p>
            {activeFilter === 'all' 
              ? 'Il n\'y a actuellement aucune annonce à afficher.'
              : `Il n'y a aucune annonce de type "${filters.find(f => f.id === activeFilter)?.label}" pour le moment.`
            }
          </p>
        </EmptyState>
      )}
    </AnnouncementsContainer>
  );
};

export default AnnouncementsSection;
