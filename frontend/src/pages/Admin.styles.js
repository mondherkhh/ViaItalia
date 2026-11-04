import styled from 'styled-components';
export const AdminSidebar = styled.aside`
  position: fixed; left: 16px; top: 16px; width: 220px; height: calc(100vh - 32px);
  background: var(--adm-panel); border: 1px solid var(--adm-border); border-radius: 24px;
  padding: 24px 16px; display: flex; flex-direction: column; z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06); transition: all 0.3s ease;
`;
export const AdminHeaderCard = styled.header`
  background: var(--adm-panel); border: 1px solid var(--adm-border); border-radius: 20px;
  padding: 0 24px; min-height: 72px; display: flex; justify-content: space-between; align-items: center;
  margin: 16px 24px 16px calc(220px + 32px); box-shadow: 0 4px 24px rgba(0,0,0,0.06);
`;
export const AdminCard = styled.div`
  background: var(--adm-panel); border: 1px solid var(--adm-border); border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px;
`;
