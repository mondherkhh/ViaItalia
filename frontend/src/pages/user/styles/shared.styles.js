import styled from 'styled-components';

// Content Card (used throughout the dashboard)
export const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;

// Button components
export const Button = styled.button`
  background: ${props => {
    if (props.variant === 'primary') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (props.variant === 'secondary') return 'rgba(255, 255, 255, 0.2)';
    if (props.variant === 'success') return 'linear-gradient(135deg, #00b09b, #96c93d)';
    if (props.variant === 'warning') return 'linear-gradient(135deg, #f093fb, #f5576c)';
    if (props.variant === 'danger') return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }};
  color: ${props => props.variant === 'secondary' ? '#ffffff' : '#ffffff'};
  border: ${props => props.variant === 'secondary' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'};
  border-radius: ${props => props.borderRadius || '12px'};
  padding: ${props => `${props.paddingY || '0.75rem'} ${props.paddingX || '1.5rem'}`};
  font-size: ${props => props.fontSize || '1rem'};
  font-weight: ${props => props.fontWeight || '600'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: ${props => props.minHeight || '44px'};
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.625rem'} ${props.mobilePaddingX || '1.25rem'}`};
    font-size: ${props => props.mobileFontSize || '0.9rem'};
    min-height: ${props => props.mobileMinHeight || '40px'};
  }
`;

export const IconButton = styled(Button)`
  width: ${props => props.size || '44px'};
  height: ${props => props.size || '44px'};
  padding: 0;
  border-radius: 50%;
  
  @media (max-width: 768px) {
    width: ${props => props.mobileSize || '40px'};
    height: ${props => props.mobileSize || '40px'};
  }
`;

export const LinkButton = styled.button`
  background: transparent;
  color: ${props => props.color || '#ffffff'};
  border: none;
  padding: 0;
  font-size: ${props => props.fontSize || '1rem'};
  font-weight: ${props => props.fontWeight || '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: ${props => props.underline ? 'underline' : 'none'};
  
  &:hover {
    color: ${props => props.hoverColor || '#667eea'};
    text-decoration: ${props => props.hoverUnderline !== false ? 'underline' : 'none'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Input components
export const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.borderRadius || '8px'};
  padding: ${props => `${props.paddingY || '0.75rem'} ${props.paddingX || '1rem'}`};
  font-size: ${props => props.fontSize || '1rem'};
  color: #ffffff;
  transition: all 0.3s ease;
  width: ${props => props.width || '100%'};
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusColor || '#667eea'};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.625rem'} ${props.mobilePaddingX || '0.875rem'}`};
    font-size: ${props => props.mobileFontSize || '0.9rem'};
  }
`;

export const Textarea = styled.textarea`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.borderRadius || '8px'};
  padding: ${props => `${props.paddingY || '0.75rem'} ${props.paddingX || '1rem'}`};
  font-size: ${props => props.fontSize || '1rem'};
  color: #ffffff;
  transition: all 0.3s ease;
  width: ${props => props.width || '100%'};
  min-height: ${props => props.minHeight || '100px'};
  resize: ${props => props.resize || 'vertical'};
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusColor || '#667eea'};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.625rem'} ${props.mobilePaddingX || '0.875rem'}`};
    font-size: ${props => props.mobileFontSize || '0.9rem'};
    min-height: ${props => props.mobileMinHeight || '80px'};
  }
`;

export const Select = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.borderRadius || '8px'};
  padding: ${props => `${props.paddingY || '0.75rem'} ${props.paddingX || '1rem'}`};
  font-size: ${props => props.fontSize || '1rem'};
  color: ${props => props.color || '#ffffff'};
  transition: all 0.3s ease;
  width: ${props => props.width || '100%'};
  cursor: pointer;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusColor || '#667eea'};
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  option {
    background: #764ba2;
    color: #ffffff;
  }
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.625rem'} ${props.mobilePaddingX || '0.875rem'}`};
    font-size: ${props => props.mobileFontSize || '0.9rem'};
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: ${props => props.size || '20px'};
  height: ${props => props.size || '20px'};
  accent-color: ${props => props.accentColor || '#667eea'};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Radio = styled.input.attrs({ type: 'radio' })`
  width: ${props => props.size || '20px'};
  height: ${props => props.size || '20px'};
  accent-color: ${props => props.accentColor || '#667eea'};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Badge component
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => `${props.paddingY || '0.25rem'} ${props.paddingX || '0.75rem'}`};
  font-size: ${props => props.fontSize || '0.75rem'};
  font-weight: ${props => props.fontWeight || '600'};
  border-radius: ${props => props.borderRadius || '20px'};
  background: ${props => {
    if (props.variant === 'primary') return 'rgba(102, 126, 234, 0.2)';
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.2)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.2)';
    if (props.variant === 'danger') return 'rgba(255, 107, 107, 0.2)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.2)';
    return 'rgba(102, 126, 234, 0.2)';
  }};
  color: ${props => {
    if (props.variant === 'primary') return '#667eea';
    if (props.variant === 'success') return '#00b09b';
    if (props.variant === 'warning') return '#f093fb';
    if (props.variant === 'danger') return '#ff6b6b';
    if (props.variant === 'info') return '#36a2eb';
    return '#667eea';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'primary') return 'rgba(102, 126, 234, 0.3)';
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.3)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.3)';
    if (props.variant === 'danger') return 'rgba(255, 107, 107, 0.3)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.3)';
    return 'rgba(102, 126, 234, 0.3)';
  }};
  gap: 0.25rem;
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.2rem'} ${props.mobilePaddingX || '0.625rem'}`};
    font-size: ${props => props.mobileFontSize || '0.7rem'};
  }
`;

// Notification component
export const Notification = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: ${props => `${props.paddingY || '1rem'} ${props.paddingX || '1.25rem'}`};
  border-radius: ${props => props.borderRadius || '12px'};
  background: ${props => {
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.1)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.1)';
    if (props.variant === 'error') return 'rgba(255, 107, 107, 0.1)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.1)';
    return 'rgba(102, 126, 234, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.3)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.3)';
    if (props.variant === 'error') return 'rgba(255, 107, 107, 0.3)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.3)';
    return 'rgba(102, 126, 234, 0.3)';
  }};
  color: ${props => {
    if (props.variant === 'success') return '#00b09b';
    if (props.variant === 'warning') return '#f093fb';
    if (props.variant === 'error') return '#ff6b6b';
    if (props.variant === 'info') return '#36a2eb';
    return '#667eea';
  }};
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.75rem'} ${props.mobilePaddingX || '1rem'}`};
  }
`;

// Alert component
export const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${props => `${props.paddingY || '1rem'} ${props.paddingX || '1.25rem'}`};
  border-radius: ${props => props.borderRadius || '12px'};
  background: ${props => {
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.1)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.1)';
    if (props.variant === 'error') return 'rgba(255, 107, 107, 0.1)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.1)';
    return 'rgba(102, 126, 234, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'success') return 'rgba(0, 176, 155, 0.3)';
    if (props.variant === 'warning') return 'rgba(240, 147, 251, 0.3)';
    if (props.variant === 'error') return 'rgba(255, 107, 107, 0.3)';
    if (props.variant === 'info') return 'rgba(54, 162, 235, 0.3)';
    return 'rgba(102, 126, 234, 0.3)';
  }};
  color: #ffffff;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: ${props => `${props.mobilePaddingY || '0.75rem'} ${props.mobilePaddingX || '1rem'}`};
  }
`;

// Loading components
export const LoadingDots = styled.div`
  display: inline-flex;
  gap: 0.25rem;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: loadingDots 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0; }
  }
  
  @keyframes loadingDots {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const LoadingBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 30%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: loadingBar 1.5s ease-in-out infinite;
  }
  
  @keyframes loadingBar {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(333%); }
  }
`;

// Progress bar
export const ProgressBar = styled.div`
  width: 100%;
  height: ${props => props.height || '8px'};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.borderRadius || '4px'};
  overflow: hidden;
  position: relative;
  
  .progress-fill {
    height: 100%;
    background: ${props => {
      if (props.variant === 'success') return 'linear-gradient(90deg, #00b09b, #96c93d)';
      if (props.variant === 'warning') return 'linear-gradient(90deg, #f093fb, #f5576c)';
      if (props.variant === 'danger') return 'linear-gradient(90deg, #ff6b6b, #ee5a24)';
      return 'linear-gradient(90deg, #667eea, #764ba2)';
    }};
    border-radius: inherit;
    transition: width 0.3s ease;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: progressShine 2s ease-in-out infinite;
    }
  }
  
  @keyframes progressShine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Card components
export const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.borderRadius || '16px'};
  padding: ${props => props.padding || '1.5rem'};
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  ${props => props.hover && `
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${props => props.mobilePadding || '1rem'};
    border-radius: ${props => props.mobileBorderRadius || '12px'};
  }
`;

export const CardHeader = styled.div`
  margin-bottom: ${props => props.marginBottom || '1rem'};
  
  @media (max-width: 768px) {
    margin-bottom: ${props => props.mobileMarginBottom || '0.75rem'};
  }
`;

export const CardBody = styled.div`
  @media (max-width: 768px) {
    font-size: ${props => props.mobileFontSize || '0.9rem'};
  }
`;

export const CardFooter = styled.div`
  margin-top: ${props => props.marginTop || '1rem'};
  padding-top: ${props => props.paddingTop || '1rem'};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    margin-top: ${props => props.mobileMarginTop || '0.75rem'};
    padding-top: ${props => props.mobilePaddingTop || '0.75rem'};
  }
`;

// List components
export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  ${props => props.spaced && `
    > li {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  `}
`;

export const ListItem = styled.li`
  display: flex;
  align-items: ${props => props.align || 'center'};
  gap: ${props => props.gap || '0.75rem'};
  padding: ${props => props.padding || '0.75rem 0'};
  border-bottom: ${props => props.borderBottom ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.mobilePadding || '0.5rem 0'};
  }
`;

// Divider
export const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: ${props => props.margin || '1rem 0'};
  
  @media (max-width: 768px) {
    margin: ${props => props.mobileMargin || '0.75rem 0'};
  }
`;

// Skeleton loader
export const Skeleton = styled.div`
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
  border-radius: ${props => props.borderRadius || '4px'};
  
  @keyframes skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export const SkeletonText = styled(Skeleton)`
  height: ${props => props.height || '1rem'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.marginBottom || '0.5rem'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SkeletonAvatar = styled(Skeleton)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

export const SkeletonCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`;
