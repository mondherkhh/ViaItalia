import styled from "styled-components";

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 999px;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: #111;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(87,213,59,0.35);
    background: var(--accent-hover);
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
  &:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--accent);
  }
`;

export const Card = styled.article`
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 30px rgba(0,0,0,0.08);
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
  }
`;
