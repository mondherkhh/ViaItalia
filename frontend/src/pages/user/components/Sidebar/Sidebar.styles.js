import styled from 'styled-components';

export const SidebarContainer = styled.aside`
  position: sticky;
  top: 96px;
  width: 250px;
  height: calc(100vh - 96px);
  background: var(--adm-bg);
  border: 1px solid var(--adm-border);
  border-radius: 24px;
  padding: 20px 16px;
  overflow-y: auto;
  z-index: 999;
  transition: all 0.3s ease;
  box-shadow: 0 4px 26px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--adm-surface);
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    position: fixed;
    width: 280px;
    top: 96px;
    left: -320px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    top: 70px;
    width: 80vw;
    max-width: 300px;
    left: -100%;
  }
`;

export const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const SidebarItem = styled.li`
  margin-bottom: 6px;
`;

export const SidebarButton = styled.button`
  width: 100%;
  background: ${props => (props.$isActive ? 'var(--adm-accent-soft)' : 'transparent')};
  border: 1px solid ${props => (props.$isActive ? 'transparent' : 'transparent')};
  border-radius: 10px;
  color: ${props => (props.$isActive ? 'var(--adm-accent)' : 'var(--adm-muted)')};
  padding: 0.65rem 0.75rem;
  font-size: 0.85rem;
  font-weight: ${props => (props.$isActive ? '600' : '500')};
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;
  position: relative;
  overflow: hidden;
  line-height: 1.35;

  &:hover {
    background: var(--adm-surface);
    color: var(--adm-text);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 1024px) {
    padding: 0.75rem 1rem;
    font-size: 13px;
    gap: 9px;
    border-radius: 10px;
  }
`;

export const SidebarIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  text-align: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
  }

  @media (max-width: 1024px) {
    width: 18px;
    svg {
      width: 17px;
      height: 17px;
    }
  }
`;

export const SidebarText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SidebarBadge = styled.span`
  background: var(--adm-danger);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.18rem 0.45rem;
  border-radius: 8px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(198, 47, 58, 0.3);
  margin-left: auto;
`;

export const SidebarSection = styled.div`
  margin-bottom: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SidebarSectionTitle = styled.div`
  padding: 0.5rem 0.75rem 0.25rem;
  margin-bottom: 0;
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--adm-muted);
  text-transform: uppercase;
  letter-spacing: 0.16em;
`;

export const SidebarDivider = styled.div`
  height: 1px;
  background: var(--adm-border);
  margin: 1rem 0;
`;

export const SidebarBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
`;

export const HeaderCard = styled.header`
  background: var(--adm-panel);
  border: 1px solid var(--adm-border);
  border-radius: 20px;
  padding: 0 20px;
  min-height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 5;
  margin: 12px 0;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);

  body.theme-light & {
    background: var(--adm-panel);
    color: var(--adm-text);
  }

  body[data-theme="dark"] & {
    background: var(--adm-panel);
  }

  @media (max-width: 768px) {
    height: 68px;
    padding: 0 16px;
    border-radius: 16px;
    margin: 8px 0;
  }

  @media (max-width: 480px) {
    height: 64px;
    padding: 0 12px;
    border-radius: 12px;
  }
`;
