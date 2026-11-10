import styled, { keyframes } from "styled-components";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

/*
  Thèmes : le mode sombre est le style par défaut.
  Le mode clair est appliqué via body.theme-light / data-theme="light".
  Les cartes ont un fond SOLIDE (pas de dégradé hérité) pour rester
  lisibles quel que soit le fond de la page.
*/
const LIGHT = `:root[data-theme="light"] &&, body[data-theme="light"] &&, body.theme-light &&`;

/* ─── Page wrapper ─────────────────────────────────────────── */

export const DashboardContainer = styled.div`
  padding: 1.5rem 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 0;
  animation: ${fadeUp} 0.45s ease both;

  @media (max-width: 768px) { padding: 0.75rem 1rem 1.5rem; }
`;

/* ─── Header ───────────────────────────────────────────────── */

export const DashboardHeader = styled.div`
  margin-bottom: 1.5rem;
`;

export const DashboardTitle = styled.h1`
  font-size: clamp(1.5rem, 3.2vw, 2rem);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
  line-height: 1.2;

  ${LIGHT} { color: #111111; }
`;

export const DashboardSubtitle = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;

  ${LIGHT} { color: #5b6873; }
`;

/* ─── Welcome banner ───────────────────────────────────────── */

export const WelcomeCard = styled.div`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #14283b 0%, #0f1f30 100%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.25rem;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.30),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  /* halo vert décoratif */
  &::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -10%;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(76, 175, 80, 0.28) 0%, transparent 65%);
    pointer-events: none;
  }

  ${LIGHT} {
    background: linear-gradient(135deg, #ffffff 0%, #f3f8f4 100%);
    border-color: rgba(17, 24, 39, 0.08);
    box-shadow: 0 10px 30px rgba(17, 24, 39, 0.07);

    &::before {
      background: radial-gradient(circle, rgba(76, 175, 80, 0.18) 0%, transparent 65%);
    }
  }

  @media (max-width: 480px) { padding: 1.25rem; }
`;

export const WelcomeMessage = styled.div`
  position: relative;
  font-size: clamp(1.2rem, 2.6vw, 1.6rem);
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;

  ${LIGHT} { color: #111111; }
`;

export const WelcomeUser = styled.span`
  background: linear-gradient(90deg, #4CAF50, #81C784, #4CAF50);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const WelcomeSubtext = styled.p`
  position: relative;
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);

  ${LIGHT} { color: #5b6873; }
`;

/* ─── Section grid ─────────────────────────────────────────── */

export const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/* SectionCard doit être défini AVANT CardPaiement (sinon erreur d'initialisation) */
export const SectionCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #111f2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background 0.25s ease, border-color 0.25s ease;
  overflow: hidden;

  /* reflet subtil */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 55%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.32);
    background: #15263a;
    border-color: rgba(76, 175, 80, 0.45);
  }

  &:focus-visible {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.22);
  }

  ${LIGHT} {
    background: #ffffff;
    color: #111111;
    border-color: rgba(17, 24, 39, 0.08);
    box-shadow: 0 2px 10px rgba(17, 24, 39, 0.05);

    &::after { background: none; }

    &:hover {
      background: #ffffff;
      box-shadow: 0 14px 30px rgba(17, 24, 39, 0.10);
      border-color: rgba(76, 175, 80, 0.5);
    }
  }
`;

/* Each card gets its area name */
export const CardPaiement = styled(SectionCard)`
  grid-area: auto;
`;

export const SectionIcon = styled.div`
  font-size: 1.4rem;
  margin-bottom: 0.85rem;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: #81C784;
  background: rgba(76, 175, 80, 0.14);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.22);
  transition: transform 0.25s ease;

  ${SectionCard}:hover & {
    transform: scale(1.06);
  }

  ${LIGHT} {
    color: #2e7d32;
    background: rgba(76, 175, 80, 0.12);
    border-color: rgba(76, 175, 80, 0.25);
  }
`;

export const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 700;
  color: #b7c6d6;
  margin: 0 0 0.4rem 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  ${LIGHT} { color: #5b6873; }
`;

export const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0 0 1rem;
  line-height: 1.5;
  flex: 1;

  ${LIGHT} { color: #5b6873; }
`;

export const SectionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(76, 175, 80, 0.14);
  color: #81C784;
  border: 1px solid rgba(76, 175, 80, 0.25);
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;

  ${LIGHT} { color: #2e7d32; }
`;

/* ─── Stats / progress grid ────────────────────────────────── */

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  background: #111f2e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  color: #ffffff;
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.30);
  }

  p {
    color: rgba(255, 255, 255, 0.65);
    margin: 0 0 0.35rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      color: rgba(255, 255, 255, 0.75);
      margin-bottom: 0.4rem;
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

  ${LIGHT} {
    background: #ffffff;
    color: #111111;
    border-color: rgba(17, 24, 39, 0.08);
    box-shadow: 0 2px 10px rgba(17, 24, 39, 0.05);

    &:hover { box-shadow: 0 10px 26px rgba(17, 24, 39, 0.09); }

    p { color: #5b6873; }
    ul li { color: #2b3844; }
  }
`;

export const CardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* petit point d'accent */
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
    flex-shrink: 0;
  }

  ${LIGHT} { color: #111111; }
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 999px;
  margin: 0.6rem 0;
  overflow: hidden;

  ${LIGHT} { background: rgba(17, 24, 39, 0.08); }
`;

export const ProgressFill = styled.div`
  width: ${(p) => p.width};
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.45);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
`;

export const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: ${(p) => (p.active ? "#4CAF50" : "rgba(255,255,255,0.45)")};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  ${LIGHT} {
    color: ${(p) => (p.active ? "#2e7d32" : "#8a97a3")};
  }
`;

export const Button = styled.button`
  margin-top: 1rem;
  background: linear-gradient(135deg, #4CAF50, #2e7d32);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.30);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(76, 175, 80, 0.42);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.30);
  }
`;