import { useState, useEffect, useCallback, useRef } from 'react';

export const useAutoRefresh = (apiCall, interval = 10000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiCallRef = useRef(apiCall);

  // Update ref when apiCall changes (but don't re-trigger effect)
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiCallRef.current();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies for fetchData

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => clearInterval(timer);
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
};
