import type { PageLoad } from './$types';
import { api } from '$lib/api/client';

export const load: PageLoad = async ({ fetch, url }) => {
	const parentId = url.searchParams.get('folder');

	const endpoint = parentId ? `/files?parentId=${parentId}` : `/files`;
	try {
		const response = await api.get<any[]>(endpoint, { customFetch: fetch });

		return {
			files: response,
			currenFolderId: parentId
		};
	} catch (error) {
		console.error('Backend Connenction Failed:', error);
		return {
			files: [],
			currentFolderId: parentId,
			error: 'Could not load your files'
		};
	}
};
