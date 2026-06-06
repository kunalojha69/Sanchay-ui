import { api } from '$lib/api/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	try {
		const userProfile = await api.get<any>('/users/me', { customFetch: fetch });

		return {
			user: userProfile
		};
	} catch (error) {
		console.error(`[Layout Loader] failed to fetch user profile: ${error}`);

		return {
			user: {
				name: 'Anonymous',
				username: 'not_found'
			}
		};
	}
};
