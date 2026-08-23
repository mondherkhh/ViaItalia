import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

/* ─── Page wrapper ─────────────────────────────────────────── */

export const DashboardContainer = styled.div`
  padding: 2.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 200px);
  animation: ${fadeUp} 0.5s ease both;

  @media (max-width: 768px) { padding: 80rem 1rem; }
`;

/* ─── Header ───────────────────────────────────────────────── */

export const DashboardHeader = styled.div`
  margin-bottom: 2.5rem;
`;

export const DashboardTitle = styled.h1`
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
`;

export const DashboardSubtitle = styled.p`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
`;

/* ─── Welcome banner ───────────────────────────────────────── */

export const WelcomeCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.10) 0%,
    rgba(255, 255, 255, 0.04) 100%
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);

  /* decorative accent line */
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    border-radius: 20px 0 0 20px;
    background: linear-gradient(180deg, #4CAF50, #2e7d32);
  }

  @media (max-width: 480px) { padding: 1.5rem; }
`;

export const WelcomeMessage = styled.div`
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.3rem;
  letter-spacing: -0.01em;
`;

export const WelcomeUser = styled.span`
  background: linear-gradient(90deg, #4CAF50, #81C784);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`;

export const WelcomeSubtext = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
`;

/* ─── Section grid ─────────────────────────────────────────── */

/* ─── Section grid (named areas) ──────────────────────────── */

export const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "annonces annonces paiement"
    "messages contrat  paiement";
  gap: 1.25rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "annonces annonces"
      "paiement paiement"
      "messages contrat";
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "annonces"
      "paiement"
      "messages"
      "contrat";
  }
`;

/* Each card gets its area name */
export const CardAnnonces = styled(SectionCard)`
  grid-area: annonces;
`;

export const CardPaiement = styled(SectionCard)`
  grid-area: paiement;
  /* stretch to fill both rows — height matches Annonces+gap+Messages/Contrat */
  align-self: stretch;
`;

export const CardMessages = styled(SectionCard)`
  grid-area: messages;
`;

export const CardContrat = styled(SectionCard)`
  grid-area: contrat;
`;

export const SectionCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;          /* left-align feels more premium */
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  overflow: hidden;

  /* subtle top highlight */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.06) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    background: rgba(255, 255, 255, 0.11);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const SectionIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const SectionTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
`;

export const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 1.25rem;
  line-height: 1.5;
  flex: 1;                          /* pushes badge to bottom */
`;

export const SectionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(76, 175, 80, 0.15);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.25);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

/* ─── Stats / progress grid ────────────────────────────────── */

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 0.4rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF50;
        flex-shrink: 0;
      }
    }
  }
`;

export const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1.25rem;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* optional accent dot */
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;
    flex-shrink: 0;
  }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  margin: 0.75rem 0;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  width: ${(p) => p.width};
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const Status = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${(p) => (p.active ? "#4CAF50" : "rgba(255,255,255,0.3)")};
`;

export const Button = styled.button`
  margin-top: 1.25rem;
  background: linear-gradient(135deg, #4CAF50, #2e7d32);
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(76, 175, 80, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;