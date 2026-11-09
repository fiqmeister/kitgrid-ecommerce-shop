// one axios setup for the whole shop: every page imports this instead of plain axios
// 1. adds the access token to every request
// 2. when the access token has expired, gets a new one with the refresh token and tries the request again ONCE
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // so pages only write '/products', not the full address
});
// calls that must NEVER trigger a refresh: a 401 here means wrong password / bad refresh token, refreshing cannot fix it
const noRefreshUrls = ['/auth/login', '/auth/register', '/auth/refresh'];


// runs BEFORE every request leaves the browser
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = 'Bearer ' + accessToken; // the format authenticate.js expects
  }
  return config; // send the request on its way
});

// runs AFTER every response comes back
api.interceptors.response.use(
  // success (status 2xx): pass the response through unchanged
  (response) => response,

  // failure: decide whether to refresh and try again
  async (error) => {
    const original = error.config; // the request that failed (url, method, data...)
    const refreshToken = localStorage.getItem('refreshToken');
    const status = error.response ? error.response.status : null; // null when Express is not running at all

    // only refresh when ALL of these are true:
    // - the API said 401 (not logged in / token expired)
    // - we have a refresh token to use
    // - this request was not already retried (stops an endless loop)
        // - it is not a login/register/refresh call (listed in noRefreshUrls above)
    const canRetry = status === 401 && refreshToken && !original.retried && !noRefreshUrls.includes(original.url);

    if (!canRetry) {
      throw error; // the page's own try/catch deals with it
    }
    original.retried = true;

    try {
      // plain axios here, NOT api: if this call failed it would go through this same code again
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', response.data.accessToken);
    } catch (refreshError) {
      // the refresh token is also expired or was revoked: the user must log in again
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // load the login page, every atom start again
      window.location.href = '/login';
      throw error;
    }

    // try the original request again: the request step above adds the NEW access token
    return api(original);
  }
);

export default api;
