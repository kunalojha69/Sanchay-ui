// src/lib/utils/fileStyles.ts
import {
	Folder,
	FileText,
	FileImage,
	FileCode,
	FileArchive,
	FileSpreadsheet,
	File as FileIcon,
	FileVideoCamera,
	FileMusic
} from 'lucide-svelte';
import type { Component } from 'svelte';

// Define the return type for perfect TypeScript support
interface FileStyle {
	icon: Component<any>;
	color: string;
	bg: string;
}

export function getFileStyles(type: string, name: string): FileStyle {
	const ext = name.split('/').pop()?.toLowerCase();

	if (type === 'folder') {
		return { icon: Folder, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-500/20' };
	}

	if (['pdf', 'docx', 'doc', 'txt', 'plain'].includes(ext || '')) {
		return { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-500/20' };
	}

	if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'psd'].includes(ext || '') || type === 'image') {
		return {
			icon: FileImage,
			color: 'text-emerald-500',
			bg: 'bg-emerald-100 dark:bg-emerald-500/20'
		};
	}

	if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '') || type === 'video') {
		return {
			icon: FileVideoCamera,
			color: 'text-purple-500',
			bg: 'bg-purple-100 dark:bg-purple-500/20'
		};
	}

	if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
		return { icon: FileMusic, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20' };
	}

	if (['zip', 'rar', '7z', 'tar'].includes(ext || '')) {
		return {
			icon: FileArchive,
			color: 'text-orange-500',
			bg: 'bg-orange-100 dark:bg-orange-500/20'
		};
	}

	if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
		return {
			icon: FileSpreadsheet,
			color: 'text-green-600',
			bg: 'bg-green-100 dark:bg-green-600/20'
		};
	}

	if (['js', 'ts', 'html', 'css', 'json', 'py'].includes(ext || '')) {
		return { icon: FileCode, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' };
	}

	// Fallback for unknown file types
	return { icon: FileIcon, color: 'text-muted-foreground', bg: 'bg-muted' };
}
