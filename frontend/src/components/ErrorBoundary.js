import React from 'react';
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#dc2626', background: '#fff0f0', borderRadius: 12, border: '1px solid #fecaca' }}>
          <h2>Une erreur est survenue</h2>
          <p>{this.state.error?.message || 'Composant en échec'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '8px 16px', border: 'none', background: '#dc2626', color: '#fff', borderRadius: 6, cursor: 'pointer' }}>Réessayer</button>
        </div>
      );
    }
    return this.props.children;
  }
}
