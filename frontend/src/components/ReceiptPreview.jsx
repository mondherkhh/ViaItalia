import React, { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
export default function ReceiptPreview({ receipt, onClose, allowDownload = true }) {
  const r = receipt || {};
  const user = r.user || {};
  const formatDate = v => v ? new Date(v).toLocaleDateString('fr-FR') : '';
  const money = v => `${Number(v || 0).toFixed(2)} DT`;
  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const downloadPdf = useCallback(async () => {
    setGenerating(true);
    setPdfError('');
    try {
      const el = document.getElementById('rc-paper');
      if (!el) throw new Error('Carte de reçu introuvable.');
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#fff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth(); // 210
      const h = pdf.internal.pageSize.getHeight(); // 297
      const margin = 15;
      const cardW = 180;
      // keep natural aspect ratio of captured card (1010 x 540 => ~1.87:1)
      const cardH = cardW * (canvas.height / canvas.width); // ~96 mm
      const x = (w - cardW) / 2;
      const y = margin;
      pdf.addImage(imgData, 'PNG', x, y, cardW, cardH);
      pdf.save(`Recu-${r.receiptNumber || ('REC-' + r.id)}.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
      setPdfError('Échec de génération du PDF : ' + (e.message || 'erreur inconnue'));
    } finally {
      setGenerating(false);
    }
  }, [r.receiptNumber, r.id]);

  return (
    <div className="rc-overlay" onClick={onClose}>
      <div className="rc-stage" onClick={e => e.stopPropagation()}>
        <div className="rc-paper" id="rc-paper">
          <img className="rc-logo" src="/receipt-logo.png" alt="Via Italia" crossOrigin="anonymous" />
          <h1 className="rc-title">REÇU DE PAIEMENT</h1>
          <div className="rc-date">Tunis le : {formatDate(r.paymentDate)}</div>
          <div className="rc-ids"><span>Receipt ID : <b>{r.receiptNumber || `REC-${r.id}`}</b></span><span>Client ID : <b>CL-{r.userId}</b></span></div>
          <div className="rc-body">
            <div className="rc-lines">
              <div>Nom et Prénom : {user.firstName || ''} {user.lastName || ''}</div>
              <div>La somme de : <b>{money(r.amount)}</b></div>
              <div>Mode de paiement : <b>{r.paymentMethod === 'ESPECE' ? 'Espèce' : 'Virement'}</b></div>
            </div>
            <div className="rc-stamp"><strong>Cachet et Signature</strong></div>
          </div>
          <p className="rc-note">Le montant versé est non remboursable, quels que soient les résultats ou décisions des organismes concernés.</p>
        </div>
        <div className="rc-actions">
          {allowDownload && (
            <button className="btn-green" onClick={downloadPdf} disabled={generating}>
              {generating ? 'Génération...' : 'Télécharger PDF'}
            </button>
          )}
          <button className="btn-grey" onClick={onClose}>Fermer</button>
        </div>
        {pdfError && <div style={{ color: '#c00', marginTop: 10, fontSize: 13 }}>{pdfError}</div>}
      </div>
    </div>
  );
}
