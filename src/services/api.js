// Base API service with mock support
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
}

export const api = {
    get: (url) => fetch(`${BASE_URL}${url}`).then(handleResponse),
    post: (url, data) => fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    put: (url, data) => fetch(`${BASE_URL}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handleResponse),
    delete: (url) => fetch(`${BASE_URL}${url}`, { method: 'DELETE' }).then(handleResponse),
};
