import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Largeur de référence du reçu sur PC (rapport 1010 x 540)
const PAPER_W = 1010;
const MOBILE_BREAKPOINT = 768;

function useViewportWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

export default function ReceiptPreview({ receipt, onClose, allowDownload = true }) {
  const r = receipt || {};
  const user = r.user || {};
  const formatDate = v => (v ? new Date(v).toLocaleDateString('fr-FR') : '');
  const money = v => `${Number(v || 0).toFixed(2)} DT`;
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const viewportW = useViewportWidth();
  const isMobile = viewportW <= MOBILE_BREAKPOINT;
  const availableW = Math.max(viewportW - 24, 200);
  const scale = isMobile ? Math.min(1, availableW / PAPER_W) : 1;

  // Hauteur réelle du reçu (mesurée) pour réserver la bonne place une fois réduit
  const paperRef = useRef(null);
  const [paperH, setPaperH] = useState(540);
  useLayoutEffect(() => {
    if (paperRef.current) setPaperH(paperRef.current.offsetHeight || 540);
  }, [isMobile, receipt, viewportW]);

  const downloadPdf = useCallback(async () => {
    setGenerating(true);
    setPdfError('');
    try {
      const el = document.getElementById('rc-paper');
      if (!el) throw new Error('Carte de reçu introuvable.');
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#fff',
        logging: false,
        windowWidth: 1100,
        onclone: doc => {
          // le PDF doit toujours être en taille PC, jamais réduit
          const wrap = doc.getElementById('rc-scale');
          if (wrap) {
            wrap.style.transform = 'none';
            wrap.style.width = PAPER_W + 'px';
          }
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const cardW = 180;
      const cardH = cardW * (canvas.height / canvas.width);
      const x = (w - cardW) / 2;
      pdf.addImage(imgData, 'PNG', x, margin, cardW, cardH);
      pdf.save(`Recu-${r.receiptNumber || ('REC-' + r.id)}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
      setPdfError('Échec de génération du PDF : ' + (e.message || 'erreur inconnue'));
    } finally {
      setGenerating(false);
    }
  }, [r.receiptNumber, r.id]);

  const paper = (
    <div
      className="rc-paper"
      id="rc-paper"
      ref={paperRef}
      style={isMobile ? { width: PAPER_W, maxWidth: 'none', flexShrink: 0 } : undefined}
    >
      <img className="rc-logo" src="/receipt-logo.png" alt="Via Italia" crossOrigin="anonymous" />
      <h1 className="rc-title">REÇU DE PAIEMENT</h1>
      <div className="rc-date">Tunis le : {formatDate(r.paymentDate)}</div>
      <div className="rc-ids">
        <span>Receipt ID : <b>{r.receiptNumber || `REC-${r.id}`}</b></span>
        <span>Client ID : <b>CL-{r.userId}</b></span>
      </div>
      <div className="rc-body">
        <div className="rc-lines">
          <div>Nom et Prénom : {user.firstName || ''} {user.lastName || ''}</div>
          <div>La somme de : <b>{money(r.amount)}</b></div>
          <div>Mode de paiement : <b>{r.paymentMethod === 'ESPECE' ? 'Espèce' : 'Virement'}</b></div>
        </div>
        <div className="rc-stamp"><strong>Cachet et Signature</strong></div>
      </div>
      <p className="rc-note">
        Le montant versé est non remboursable, quels que soient les résultats ou décisions des organismes concernés.
      </p>
    </div>
  );

  const actions = (
    <div
      className="rc-actions"
      style={isMobile ? { display: 'flex', gap: 10, marginTop: 14, position: 'static' } : undefined}
    >
      {allowDownload && (
        <button
          className="btn-green"
          onClick={downloadPdf}
          disabled={generating}
          style={isMobile ? { flex: 1 } : undefined}
        >
          {generating ? 'Génération...' : 'Télécharger PDF'}
        </button>
      )}
      <button className="btn-grey" onClick={onClose} style={isMobile ? { flex: 1 } : undefined}>
        Fermer
      </button>
    </div>
  );

  // ---------- PC : structure d'origine, inchangée ----------
  if (!isMobile) {
    return (
      <div className="rc-overlay" onClick={onClose}>
        <div className="rc-stage" onClick={e => e.stopPropagation()}>
          {paper}
          {actions}
          {pdfError && <div style={{ color: '#c00', marginTop: 10, fontSize: 13 }}>{pdfError}</div>}
        </div>
      </div>
    );
  }

  // ---------- Téléphone : même reçu que sur PC, réduit à la largeur de l'écran ----------
  return (
    <div
      className="rc-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        overflowY: 'auto',
        display: 'block',
        padding: 12,
        boxSizing: 'border-box',
        background: 'rgba(0,0,0,.6)',
      }}
    >
      <div
        className="rc-stage"
        onClick={e => e.stopPropagation()}
        style={{
          width: availableW,
          maxWidth: availableW,
          maxHeight: 'none',
          margin: '0 auto',
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        }}
      >
        <div style={{ width: PAPER_W * scale, height: paperH * scale, overflow: 'hidden', borderRadius: 12 }}>
          <div
            id="rc-scale"
            style={{
              width: PAPER_W,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {paper}
          </div>
        </div>
        {actions}
        {pdfError && <div style={{ color: '#fff', marginTop: 10, fontSize: 13 }}>{pdfError}</div>}
      </div>
    </div>
  );
}