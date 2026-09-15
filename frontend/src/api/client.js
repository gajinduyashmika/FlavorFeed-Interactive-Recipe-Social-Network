const BASE_URL = '/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!options.isMultipart && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  get: (endpoint, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(queryString ? `${endpoint}?${queryString}` : endpoint, { method: 'GET' });
  },

  post: (endpoint, body, isMultipart = false) => {
    return request(endpoint, { method: 'POST', body, isMultipart });
  },

  put: (endpoint, body, isMultipart = false) => {
    return request(endpoint, { method: 'PUT', body, isMultipart });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  },
};
