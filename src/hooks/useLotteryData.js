import { useState, useEffect } from 'react';

// Primary API: Loteriascaixa.com (unofficial but reliable)
// Primary API: Loteriascaixa.com (broken) -> Using fallback as primary or a community API
// const API_URL = 'https://loteriascaixa.com/api/mega-sena/';
const API_URL = 'https://loteriascaixa-api.herokuapp.com/api/mega-sena';
// Fallback API: Caixa official (with CORS proxy)
const FALLBACK_API_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/';
const CORS_PROXY = 'https://corsproxy.io/?';

const CACHE_KEY = 'megasena_data';
const CACHE_VERSION = '1.0';
const UPDATE_HOUR = 2; // 02:00 AM
const UPDATE_MINUTE = 2; // 02:02 AM

/**
 * Calculate the next scheduled update time (02:02 AM)
 * @returns {number} Timestamp of next 02:02 AM
 */
function getNextUpdateTime() {
  const now = new Date();
  const next = new Date(now);

  // Set to 02:02 AM
  next.setHours(UPDATE_HOUR, UPDATE_MINUTE, 0, 0);

  // If 02:02 AM has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime();
}

/**
 * Check if cache should be updated based on scheduled time
 * @param {number} cachedTimestamp - Timestamp when data was cached
 * @returns {boolean} True if cache should be updated
 */
function shouldUpdateCache(cachedTimestamp) {
  if (!cachedTimestamp) return true;

  const now = new Date();
  const cached = new Date(cachedTimestamp);

  // Check if we've passed 02:02 AM since the last cache
  const todayUpdate = new Date(now);
  todayUpdate.setHours(UPDATE_HOUR, UPDATE_MINUTE, 0, 0);

  // If cached before today's 02:02 AM and we've passed 02:02 AM today, update
  if (cached < todayUpdate && now >= todayUpdate) {
    return true;
  }

  // If it's been more than 24 hours (fallback safety check)
  const hoursSinceCache = (now - cached) / (1000 * 60 * 60);
  if (hoursSinceCache >= 24) {
    return true;
  }

  return false;
}

export function useLotteryData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextUpdate, setNextUpdate] = useState(null);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Check cache first
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp, version } = JSON.parse(cached);

          // Check version compatibility
          if (version && version !== CACHE_VERSION) {
            console.log('Cache version mismatch, invalidating cache');
            localStorage.removeItem(CACHE_KEY);
          } else if (!shouldUpdateCache(timestamp)) {
            // Cache is still valid
            setData(cachedData);
            setLastUpdate(new Date(timestamp));
            setNextUpdate(new Date(getNextUpdateTime()));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error parsing cached data:', err);
          localStorage.removeItem(CACHE_KEY);
        }
      }
    }

    // Try primary API first
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const apiData = await response.json();

      // Validate data
      if (!Array.isArray(apiData) || apiData.length === 0) {
        throw new Error('Invalid API response format');
      }

      // Cache the data with version and metadata
      const now = Date.now();
      const cacheData = {
        data: apiData,
        timestamp: now,
        version: CACHE_VERSION,
        nextUpdate: getNextUpdateTime()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setData(apiData);
      setLastUpdate(new Date(now));
      setNextUpdate(new Date(getNextUpdateTime()));
      setError(null);
    } catch (primaryError) {
      console.warn('Primary API failed:', primaryError.message);

      // Try fallback API with CORS proxy
      try {
        const fallbackUrl = CORS_PROXY + encodeURIComponent(FALLBACK_API_URL);
        const response = await fetch(fallbackUrl);

        if (!response.ok) {
          throw new Error(`Fallback API returned ${response.status}`);
        }

        const apiData = await response.json();

        // Cache the fallback data with version and metadata
        const now = Date.now();
        const cacheData = {
          data: apiData,
          timestamp: now,
          version: CACHE_VERSION,
          nextUpdate: getNextUpdateTime()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setData(apiData);
        setLastUpdate(new Date(now));
        setNextUpdate(new Date(getNextUpdateTime()));
        setError(null);
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError.message);

        // Try to use old cache as last resort
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data: cachedData, timestamp } = JSON.parse(cached);
            setData(cachedData);
            setLastUpdate(new Date(timestamp));
            setError('Usando dados em cache. Última atualização pode estar desatualizada.');
          } catch {
            // Cache parse failed, will use fallback static data
            setError('Usando dados estáticos.');
          }
        } else {
          // No cache available, will use fallback static data
          setError('Usando dados estáticos.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdate,
    nextUpdate,
    refresh: () => fetchData(true)
  };
}
