import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('access_token');

	const path = event.url.pathname;
	const isAuthRoute = path.startsWith('/login');
	const isApiRoute = path.startsWith('/api');

	if (isApiRoute) {
		return resolve(event);
	}

	if (!token && !isAuthRoute) {
		throw redirect(303, '/login');
	}

	if (token && isAuthRoute) {
		throw redirect(303, '/');
	}

	return resolve(event);
};
