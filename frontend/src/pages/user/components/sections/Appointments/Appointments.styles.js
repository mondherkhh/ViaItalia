import styled from 'styled-components';

/* Dark mode : ton app ajoute la classe "theme-dark" sur <body> */
const DARK = `body.theme-dark &`;

/* ───────── Titre & en-tête ───────── */

export const AppointmentsTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #059669 60%, #047857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const AppointmentsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

export const AppointmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  & * {
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    gap: 1.25rem;
  }
`;

/* ───────── Sections ───────── */

export const AppointmentsSubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

export const AppointmentsSubTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before {
    content: '';
    width: 4px;
    height: 1.1em;
    border-radius: 4px;
    background: linear-gradient(180deg, #10b981, #059669);
  }

  ${DARK} {
    color: #f3f4f6;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const AppointmentsListHeader = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;

  &::before {
    content: '';
    width: 4px;
    height: 1.1em;
    border-radius: 4px;
    background: linear-gradient(180deg, #10b981, #059669);
  }

  ${DARK} {
    color: #f3f4f6;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const ToggleButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.25rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 0.7rem 1rem;
  }
`;

/* ───────── Formulaire de réservation ───────── */

export const BookingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(17, 24, 39, 0.06);
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease;

  ${DARK} {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    padding: 1.125rem;
    gap: 0.875rem;
    border-radius: 14px;
  }
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
`;

export const FormLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #4b5563;

  ${DARK} {
    color: #d1d5db;
  }
`;

const fieldBase = `
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #111827;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    background: #fff;
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  body.theme-dark & {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
    color: #f3f4f6;
    color-scheme: dark;
  }

  body.theme-dark &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }

  body.theme-dark &:focus {
    background: rgba(255, 255, 255, 0.1);
    border-color: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.22);
  }

  @media (max-width: 768px) {
    font-size: 16px; /* évite le zoom automatique sur téléphone */
    padding: 0.7rem 0.9rem;
  }
`;

export const FormInput = styled.input`
  ${fieldBase}
`;

export const FormSelect = styled.select`
  ${fieldBase}
  cursor: pointer;

  option {
    background: #fff;
    color: #111827;
  }

  body.theme-dark & option {
    background: #111827;
    color: #f3f4f6;
  }
`;

export const FormTextarea = styled.textarea`
  ${fieldBase}
  resize: vertical;
  min-height: 90px;
`;

export const SubmitButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
  }
`;

export const LoadingSpinner = styled.svg`
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/* ───────── Liste des rendez-vous ───────── */

export const AppointmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

export const AppointmentCard = styled.div`
  position: relative;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.125rem 1.25rem 1.125rem 1.5rem;
  box-shadow: 0 2px 12px rgba(17, 24, 39, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  animation: fadeInUp 0.3s ease;

  /* liseré vert à gauche */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #10b981, #059669);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(17, 24, 39, 0.1);
    border-color: rgba(16, 185, 129, 0.35);
  }

  ${DARK} {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  ${DARK}:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(16, 185, 129, 0.45);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    padding: 1rem 1rem 1rem 1.25rem;
    border-radius: 14px;
  }
`;

export const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

export const AppointmentContent = styled.div`
  flex: 1;
  min-width: 0;

  @media (max-width: 480px) {
    flex: none;
  }
`;

export const AppointmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: 480px) {
    justify-content: flex-end;
    margin-top: 0.25rem;
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  ${props => {
    switch (props.status) {
      case 'CONFIRMED':
        return `
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        `;
      case 'CANCELLED':
        return `
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
        `;
      case 'PENDING':
      default:
        return `
          background: rgba(245, 158, 11, 0.14);
          color: #d97706;
        `;
    }
  }}

  ${DARK} {
    ${props => {
      switch (props.status) {
        case 'CONFIRMED':
          return `background: rgba(16, 185, 129, 0.2); color: #34d399;`;
        case 'CANCELLED':
          return `background: rgba(239, 68, 68, 0.2); color: #f87171;`;
        default:
          return `background: rgba(245, 158, 11, 0.2); color: #fbbf24;`;
      }
    }}
  }
`;

export const AppointmentTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.4rem 0;
  overflow-wrap: anywhere;

  ${DARK} {
    color: #f3f4f6;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const AppointmentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

export const AppointmentDetail = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-wrap: anywhere;

  ${DARK} {
    color: #9ca3af;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const DetailIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #10b981;
`;

export const CancelButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: scale(0.97);
  }

  ${DARK} {
    color: #f87171;
    background: rgba(239, 68, 68, 0.15);
  }

  ${DARK}:hover {
    color: #fff;
  }

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
  }
`;

export const StatusText = styled.span`
  font-size: 0.8rem;
  font-weight: 600;

  ${props => {
    switch (props.status) {
      case 'CONFIRMED':
        return `color: #059669;`;
      case 'CANCELLED':
        return `color: #dc2626;`;
      case 'PENDING':
      default:
        return `color: #d97706;`;
    }
  }}
`;

/* ───────── États vides ───────── */

export const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: #6b7280;
  background: #f9fafb;
  border: 1.5px dashed #d1d5db;
  border-radius: 16px;

  ${DARK} {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 480px) {
    padding: 1.75rem 1rem;
    border-radius: 14px;
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 2.75rem;
  margin-bottom: 0.75rem;
  opacity: 0.75;

  @media (max-width: 480px) {
    font-size: 2.25rem;
  }
`;

export const EmptyStateText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;

  &:first-of-type {
    font-weight: 600;
    color: #374151;
  }

  ${DARK}:first-of-type {
    color: #e5e7eb;
  }

  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

/* ───────── Notification (toast) ───────── */

export const NotificationMessage = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  max-width: calc(100vw - 2rem);
  padding: 0.8rem 1.25rem;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideInRight 0.3s ease;

  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280, #4b5563);
          box-shadow: 0 8px 24px rgba(107, 114, 128, 0.35);
        `;
    }
  }}

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
    font-size: 0.85rem;
  }
`;