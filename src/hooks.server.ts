import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const handleRedirects: Handle = async ({ event, resolve }) => {
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

const handleTheme: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('theme') || 'light';

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			if (theme === 'dark') {
				return html.replace('<html lang="en">', '<html class="dark">');
			}
			return html;
		}
	});
};

export const handle = sequence(handleRedirects, handleTheme);
