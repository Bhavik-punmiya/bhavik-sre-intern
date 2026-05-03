export const withRetry = async (fn, attempts = 3, initialDelay = 1000) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, err.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};
