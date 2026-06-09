type FetchFunction = typeof fetch;

interface ApiOptions extends RequestInit {
	customFetch?: FetchFunction;
}

class ApiClient {
	private baseUrl = '/api';

	private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
		const { customFetch = fetch, ...init } = options;
		const url = `${this.baseUrl}${endpoint}`;

		const headers = new Headers(init.headers);

		if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
			headers.set('Content-Type', 'application/json');
		}

		const config: RequestInit = {
			...init,
			headers
		};

		try {
			const response = await customFetch(url, config);

			if (!response.ok) {
				if (response.status === 401) {
					console.warn('Session expired or unauthorized');
				}
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.message || `Backend Error: ${response.status}`);
			}

			const text = await response.text();
			return text ? JSON.parse(text) : ({} as T);
		} catch (error) {
			console.error(`[API CLIENT] error on ${endpoint}:`, error);
			throw error;
		}
	}

	get<T>(endpoint: string, options?: ApiOptions) {
		return this.request<T>(endpoint, { ...options, method: 'GET' });
	}

	post<T>(endpoint: string, data?: any, options?: ApiOptions) {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: data instanceof FormData ? data : JSON.stringify(data)
		});
	}

	delete<T>(endpoint: string, options?: ApiOptions) {
		return this.request<T>(endpoint, { ...options, method: 'DELETE' });
	}

	patch<T>(endpoint: string, data?: any, options?: ApiOptions) {
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: data instanceof FormData ? data : JSON.stringify(data)
		});
	}
}

export const api = new ApiClient();
