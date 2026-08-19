// Date and time utilities
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('fr-FR', defaultOptions);
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Il y a quelques secondes';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else {
    return formatDate(dateString);
  }
};

// Status and type utilities
export const getStatusColor = (status) => {
  const colorMap = {
    'PENDING': 'yellow',
    'CONFIRMED': 'green',
    'CANCELLED': 'red',
    'COMPLETED': 'blue',
    'UPLOADED': 'blue',
    'REJECTED': 'red',
    'IN_PROGRESS': 'purple',
    'EN_LIGNE': 'blue',
    'PRESENTIEL': 'green'
  };
  
  return colorMap[status] || 'gray';
};

export const getStatusIcon = (status) => {
  const iconMap = {
    'PENDING': '⏳',
    'CONFIRMED': '✅',
    'CANCELLED': '❌',
    'COMPLETED': '🎉',
    'UPLOADED': '📤',
    'REJECTED': '🚫',
    'IN_PROGRESS': '🔄',
    'EN_LIGNE': '💻',
    'PRESENTIEL': '🏢'
  };
  
  return iconMap[status] || '📋';
};

export const getStatusLabel = (status) => {
  const labelMap = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmé',
    'CANCELLED': 'Annulé',
    'COMPLETED': 'Terminé',
    'UPLOADED': 'Téléversé',
    'REJECTED': 'Rejeté',
    'IN_PROGRESS': 'En cours',
    'EN_LIGNE': 'En ligne',
    'PRESENTIEL': 'Présentiel'
  };
  
  return labelMap[status] || status;
};

export const getTypeColor = (type) => {
  const colorMap = {
    'consultation': 'blue',
    'documents': 'green',
    'visa': 'purple',
    'logement': 'orange',
    'orientation': 'pink',
    'INFO': 'blue',
    'SUCCESS': 'green',
    'WARNING': 'yellow',
    'ERROR': 'red',
    'UPDATE': 'purple'
  };
  
  return colorMap[type] || 'gray';
};

export const getTypeIcon = (type) => {
  const iconMap = {
    'consultation': '🗣️',
    'documents': '📄',
    'visa': '🛂',
    'logement': '🏠',
    'orientation': '🧭',
    'INFO': 'ℹ️',
    'SUCCESS': '✅',
    'WARNING': '⚠️',
    'ERROR': '❌',
    'UPDATE': '🔄'
  };
  
  return iconMap[type] || '📋';
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

export const isPdfFile = (filename) => {
  return getFileExtension(filename).toLowerCase() === 'pdf';
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// String utilities
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Array utilities
export const sortByDate = (array, dateField = 'createdAt', order = 'desc') => {
  return array.sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const unique = (array, key) => {
  return array.filter((item, index, self) =>
    index === self.findIndex((t) => t[key] === item[key])
  );
};

// Object utilities
export const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Local storage utilities
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Random utilities
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const randomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
