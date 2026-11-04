import React, { useState, useEffect, useCallback } from 'react';
import { FiBell, FiPaperclip, FiDollarSign, FiFolder, FiMessageSquare, FiFileText } from 'react-icons/fi';
import axiosInstance from '../../../../../api/axiosInstance';

const TYPE_ICONS = {
  RECEIPT: FiPaperclip,
  PAYMENT: FiDollarSign,
  DOSSIER: FiFolder,
  MESSAGE: FiMessageSquare,
  FOLDER_ACCESS: FiFolder,
  DOCUMENT_ADDED: FiFileText,
  DEFAULT: FiBell,
};

const TYPE_TITLES = {
  RECEIPT: 'Reçu disponible',
  PAYMENT: 'Paiement confirmé',
  DOSSIER: 'Dossier mis à jour',
  MESSAGE: 'Message de votre conseiller',
  FOLDER_ACCESS: 'Accès aux documents',
  DOCUMENT_ADDED: 'Document ajouté',
  DEFAULT: 'Notification',
};

function inferType(item) {
  if (item.type) return item.type;
  const t = (item.title || '').toLowerCase();
  const m = (item.message || item.content || '').toLowerCase();
  if (t.includes('accès') || m.includes('autorisé') || m.includes('dossier')) return 'FOLDER_ACCESS';
  if (t.includes('reçu') || t.includes('paiement') || t.includes('montant')) return 'RECEIPT';
  if (t.includes('paiement') || m.includes('paiement') || m.includes('confirmé')) return 'PAYMENT';
  if (t.includes('dossier') || m.includes('dossier')) return 'DOSSIER';
  if (t.includes('message') || m.includes('conseiller')) return 'MESSAGE';
  return 'DEFAULT';
}

function cleanMessage(msg) {
  if (!msg) return '';
  // Retirer les emojis placés à l'intérieur du texte
  return msg.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

function groupByDate(items) {
  const groups = { today: [], yesterday: [], older: [] };
  const now = new Date();
  const dStr = (d) => d.toISOString().split('T')[0];
  const todayStr = dStr(now);
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = dStr(yesterday);
  for (const it of items) {
    const d = new Date(it.createdAt || it.readAt || Date.now());
    const s = dStr(d);
    if (s === todayStr) groups.today.push(it);
    else if (s === yesterdayStr) groups.yesterday.push(it);
    else groups.older.push(it);
  }
  return groups;
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all | unread
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true); setError(false);
      const res = await axiosInstance.get('/notifications', {
        params: { page: p, limit: 20, unread: filter === 'unread' ? 1 : 0 }
      });
      const data = res.data?.data || [];
      const countRes = await axiosInstance.get('/notifications/unread/count');
      setUnreadCount(countRes.data?.data || 0);
      setItems(prev => p === 1 ? data : [...prev, ...data]);
      setPage(p);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(1); }, [filter]);

  const handleMarkAll = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const groups = groupByDate(items);
  const hasData = items.length > 0;

  return (
    <div style={{ color: '#fff', padding: '1rem 0' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filter === 'all' ? '#138a5b' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Toutes</button>
        <button onClick={() => setFilter('unread')} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filter === 'unread' ? '#138a5b' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Non lues {unreadCount > 0 ? `(${unreadCount})` : ''}</button>
        <button onClick={handleMarkAll} style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, border: 'none', background: '#138a5b', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Tout marquer comme lu</button>
      </div>

      {!loading && hasData && (
        <div>
          {groups.today.length > 0 && <h3 style={{ fontSize: 14, opacity: 0.85, margin: '12px 0 6px' }}>Aujourd'hui</h3>}
          {groups.today.map((n) => (
            <NotificationRow key={n.id} item={n} onRead={handleRead} />
          ))}
          {groups.yesterday.length > 0 && <h3 style={{ fontSize: 14, opacity: 0.85, margin: '12px 0 6px' }}>Hier</h3>}
          {groups.yesterday.map((n) => (
            <NotificationRow key={n.id} item={n} onRead={handleRead} />
          ))}
          {groups.older.length > 0 && <h3 style={{ fontSize: 14, opacity: 0.85, margin: '12px 0 6px' }}>Plus ancien</h3>}
          {groups.older.map((n) => (
            <NotificationRow key={n.id} item={n} onRead={handleRead} />
          ))}
        </div>
      )}

      {!loading && !hasData && !error && (
        <div style={{ textAlign: 'center', padding: 40, opacity: 0.7 }}>Aucune notification pour le moment</div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Erreur de chargement</p>
          <button onClick={() => load(1)} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 8, border: 'none', background: '#138a5b', color: '#fff', cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 30, opacity: 0.7 }}>Chargement...</div>}

      {hasData && !loading && (
        <button onClick={() => load(page + 1)} style={{ display: 'block', margin: '20px auto 0', padding: '8px 24px', borderRadius: 20, border: 'none', background: '#138a5b', color: '#fff', cursor: 'pointer' }}>Charger plus</button>
      )}
    </div>
  );
}

function NotificationRow({ item, onRead }) {
  const type = inferType(item);
  const Icon = TYPE_ICONS[type] || TYPE_ICONS.DEFAULT;
  const title = TYPE_TITLES[type] || (item.title || 'Notification');
  const link = item.link || '#';
  const isRead = !!item.isRead;
  return (
    <a
      href={link}
      onClick={(e) => { if (!isRead) { e.preventDefault(); onRead(item.id); setTimeout(() => window.location.href = link, 300); } }}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 12,
        background: isRead ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
        textDecoration: 'none', color: '#fff', marginBottom: 8,
        border: isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(19,138,91,0.3)',
        transition: 'background 0.2s'
      }}
      aria-label={title}
    >
      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: '#138a5b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.3 }}>{cleanMessage(item.message || item.content || '')}</div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{formatTime(item.createdAt)}</div>
      </div>
      {!isRead && <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#20c875', marginTop: 6 }} aria-label="Non lu" />}
    </a>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.round((now - d) / 60000);
  if (diff < 1) return 'il y a un instant';
  if (diff < 60) return `il y a ${diff} min`;
  if (diff < 1440) return `il y a ${Math.round(diff / 60)} h`;
  return d.toLocaleDateString('fr-FR');
}
