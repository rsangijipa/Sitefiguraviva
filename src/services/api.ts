// Base API service with mock support
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
}

export const api = {
    get: <T>(url: string): Promise<T> => fetch(`${BASE_URL}${url}`).then(res => handleResponse<T>(res)),
    post: <T>(url: string, data: any): Promise<T> => fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => handleResponse<T>(res)),
    put: <T>(url: string, data: any): Promise<T> => fetch(`${BASE_URL}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => handleResponse<T>(res)),
    delete: <T>(url: string): Promise<T> => fetch(`${BASE_URL}${url}`, { method: 'DELETE' }).then(res => handleResponse<T>(res)),
};
