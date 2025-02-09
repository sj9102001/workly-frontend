const API_BASE_URL = 'http://localhost:8080/api';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new ApiError(response.status, 'Invalid response from server');
    }

    const data = await response.json();
    console.log(data);
    if (!response.ok) {
        throw new ApiError(response.status, data.message || 'Something went wrong');
    }

    return data;
}

export const api = {
    get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

    post: <T, B = unknown>(endpoint: string, body: B) =>
        apiRequest<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    patch: <T, B = unknown>(endpoint: string, body: B) =>
        apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    delete: <T>(endpoint: string) =>
        apiRequest<T>(endpoint, { method: 'DELETE' }),
}; 