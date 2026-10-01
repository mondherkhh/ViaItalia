import styled from "styled-components";

export const StatCard = styled.article`
  position: relative;
  background: var(--background-secondary);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.8rem 1.4rem;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-accent);
  }
  .stat-number {
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .stat-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 0.25rem;
  }
  .stat-desc {
    font-size: 0.82rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    line-height: 1.45;
  }
`;
