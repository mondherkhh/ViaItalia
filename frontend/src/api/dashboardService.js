import axiosInstance from './axiosInstance';

/**
 * Client dashboard data source.
 *
 * Everything comes from ONE endpoint: GET /student/dashboard
 * The server resolves the student from the JWT (req.user.userId), so no
 * user id ever travels in the URL. When several accessors are called during
 * the same render, the in-flight request is reused and the payload is cached
 * for a short window, so the browser issues a single network call.
 */

const CACHE_TTL_MS = 15000;

let cache = null;          // { at: number, data: object }
let inFlight = null;       // Promise resolving to the payload

const asList = value => (Array.isArray(value) ? value : []);

function normalize(payload) {
  const data = payload && payload.data ? payload.data : {};
  return {
    profile: data.profile || null,
    dossier: data.dossier || null,
    progressPercent: Number(data.progressPercent || 0),
    payments: {
      items: asList(data.payments && data.payments.items),
      totalPaid: Number((data.payments && data.payments.totalPaid) || 0)
    },
    announcements: asList(data.announcements),
    messages: asList(data.messages),
    contract: data.contract || null,
    counts: data.counts || { openTasks: 0, applications: 0, documents: 0 }
  };
}

async function fetchDashboard() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return cache.data;
  }
  if (!inFlight) {
    inFlight = axiosInstance
      .get('/student/dashboard')
      .then(response => {
        const body = response.data || {};
        if (body.success === false) {
          throw new Error(body.message || 'Erreur serveur');
        }
        const data = normalize(body);
        cache = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

function invalidateCache() {
  cache = null;
}

const dashboardService = {
  /** Full normalized dashboard payload. */
  getDashboardData: async () => {
    try {
      return await fetchDashboard();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  /** Same payload; kept for API compatibility with existing call sites. */
  getDashboardStats: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: { ...data.counts, progressPercent: data.progressPercent } };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, data: {} };
    }
  },

  /** Payments list (all items, not truncated). */
  getPaymentInfo: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.payments.items };
    } catch (error) {
      console.error('Error fetching payment info:', error);
      return { success: false, data: [] };
    }
  },

  /** Latest payment, or null. */
  getLatestPayment: async () => {
    try {
      const data = await fetchDashboard();
      const items = data.payments.items;
      const latest = items.length
        ? [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;
      return { success: true, data: latest };
    } catch (error) {
      console.error('Error fetching latest payment:', error);
      return { success: false, data: null };
    }
  },

  /** Dossier of the authenticated student. */
  getDossierInfo: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.dossier };
    } catch (error) {
      console.error('Error fetching dossier info:', error);
      return { success: false, data: null };
    }
  },

  /** Active announcements. */
  getLatestAnnouncements: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.announcements };
    } catch (error) {
      console.error('Error fetching latest announcements:', error);
      return { success: false, data: [] };
    }
  },

  /** Latest messages sent to the student. */
  getLatestMessages: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.messages };
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      return { success: false, data: [] };
    }
  },

  /** Contract of the authenticated student. */
  getContractInfo: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.contract };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return { success: false, data: null };
    }
  },

  /** Contract status (same payload). */
  getContractStatus: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.contract };
    } catch (error) {
      console.error('Error fetching contract status:', error);
      return { success: false, data: null };
    }
  },

  /** Dossier progress (same payload). */
  getDossierProgress: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: { dossier: data.dossier, progressPercent: data.progressPercent } };
    } catch (error) {
      console.error('Error fetching dossier progress:', error);
      return { success: false, data: null };
    }
  },

  /** Counters shown in the dashboard header. */
  getUpcomingAppointmentsCount: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.counts.openTasks };
    } catch (error) {
      console.error('Error fetching upcoming appointments count:', error);
      return { success: false, data: 0 };
    }
  },

  /** Unread messages count (not exposed by the aggregate endpoint yet). */
  getUnreadMessagesCount: async () => {
    try {
      const data = await fetchDashboard();
      return { success: true, data: data.messages.length };
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      return { success: false, data: 0 };
    }
  },

  /** Drop the cached payload (used by the Retry button). */
  invalidateCache
};

export default dashboardService;
