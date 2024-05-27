// config.ts
// src/config.js
const url = process.env.REACT_APP_API_BASE_URL || '"http://localhost:8000"';

export const apiURL = url.replace(/"/g, '');