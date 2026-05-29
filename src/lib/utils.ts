import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function dateFormat(rawdate: string) {
	const date = new Date(rawdate);

	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'long',
		day: '2-digit'
	}).format(date);
}

export function sizeFormat(bytes: number | string | null | undefined): string {
	if (bytes === null || bytes === undefined || bytes === '') return '--';

	const numBytes = Number(bytes);
	if (numBytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];

	const i = Math.floor(Math.log(numBytes) / Math.log(k));

	return parseFloat((numBytes / Math.pow(k, i)).toFixed(1)) + '' + sizes[i];
}
