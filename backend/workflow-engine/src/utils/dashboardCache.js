import { getLiveIncidents } from '../db/postgres.js';
import { updateDashboardCache } from '../services/debounce.js';

export const rebuildDashboardCache = async () => {
  try {
    const incidents = await getLiveIncidents();
    await updateDashboardCache(incidents);
    console.log('[CACHE] Dashboard cache rebuilt');
  } catch (err) {
    console.error('[CACHE] Failed to rebuild dashboard cache:', err.message);
  }
};
