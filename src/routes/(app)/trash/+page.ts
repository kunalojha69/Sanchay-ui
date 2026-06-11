// src/routes/(app)/trash/+page.ts
import { api } from '$lib/api/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		// Assuming your backend has a specific endpoint for trashed items
		const response = await api.get<any[]>('/files/trash', { customFetch: fetch });
		return {
			files: response || []
		};
	} catch (error) {
		console.error('[Trash Loader] Failed to fetch trashed files:', error);
		return {
			files: [],
			error: 'Could not load trash.'
		};
	}
};
