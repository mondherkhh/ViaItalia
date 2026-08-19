 import React, { useState } from 'react';

const AnnouncementCard = ({ 
  announcement,
  className = "",
  onLike,
  onComment,
  onShare 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 24)) / (1000 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60)) / 1000);

    if (diffDays > 0) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'À l\'instant';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'INFO':
        return '#3B82F6';
      case 'SUCCESS':
        return '#10B981';
      case 'WARNING':
        return '#F59E0B';
      case 'URGENT':
        return '#EF4444';
      case 'ACADEMIQUE':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'INFO':
        return '📢';
      case 'SUCCESS':
        return '✅';
      case 'WARNING':
        return '⚠️';
      case 'URGENT':
        return '🔴';
      case 'ACADEMIQUE':
        return '🎓';
      default:
        return '📢';
    }
  };

  const handleLinkClick = () => {
    if (announcement.link) {
      if (announcement.link.startsWith('http://') || announcement.link.startsWith('https://')) {
        window.open(announcement.link, '_blank');
      } else {
        console.log('Navigate to:', announcement.link);
      }
    }
  };

  return (
    <div 
      className={`announcement-card ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Blur Effect */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          zIndex: 0
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Icon and Date */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: getTypeColor(announcement.type),
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Additional blur layer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '50%'
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>
                {getTypeIcon(announcement.type)}
              </span>
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {announcement.type}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '2px'
              }}>
                {formatRelativeTime(announcement.createdAt)}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div style={{
            background: 'rgba(76, 175, 80, 0.2)',
            color: '#4CAF50',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            Actif
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#ffffff',
          margin: '0 0 10px 0',
          lineHeight: '1.4'
        }}>
          {announcement.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.5',
          margin: '0 0 15px 0',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {announcement.content}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Author Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {announcement.author ? announcement.author.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '600'
              }}>
                {announcement.author || 'Admin'}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                {new Date(announcement.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {announcement.link && (
              <button
                onClick={handleLinkClick}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                }}
              >
                🔗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;