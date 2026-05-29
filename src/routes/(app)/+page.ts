import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/files');

		if (response.ok) {
			const files = await response.json();
			return {
				files: files
			};
		}
	} catch (error) {
		console.error('Backend Connenction Failed:', error);
	}

	return {
		files: []
	};
};
