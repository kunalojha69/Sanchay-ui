// src/routes/(app)/usage/+page.ts
import { api } from '$lib/api/client';
import type { PageLoad } from './$types';
import { dateFormat } from '$lib/utils';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const rawActivity = await api.get<any>('/uploads/stats', { customFetch: fetch });
		const fileStats = await api.get<any>('/files/stats', { customFetch: fetch });
		const uploadActivity = rawActivity.map((item) => {
			const date = dateFormat(item.uploadDate);

			return {
				date: date,
				count: item.totalUploaded,
				id: crypto.randomUUID()
			};
		});

		return {
			stats: {
				usedSpace: fileStats.totalSize,
				totalFiles: fileStats.totalFiles,
				uploadActivity: uploadActivity
			}
		};
	} catch (error) {
		console.error('Failed to load usage stats:', error);
		return { stats: { usedSpace: 0, totalFiles: 0, uploadActivity: [] } };
	}
};
