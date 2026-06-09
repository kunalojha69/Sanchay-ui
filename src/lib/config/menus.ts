import { CloudDownload, Copy, FolderOpen, FolderPen, Scissors, Trash } from 'lucide-svelte';
import type { Component } from 'svelte';
export type MenuActionId = 'open' | 'download' | 'rename' | 'copy' | 'move' | 'delete';

export interface MenuItem {
	id: MenuActionId;
	label: string;
	icon: Component<any>;
	isDanger?: boolean;
}

const ICONS = {
	open: FolderOpen,
	download: CloudDownload,
	rename: FolderPen,
	copy: Copy,
	move: Scissors,
	delete: Trash
};

export const FOLDER_MENU: MenuItem[] = [
	{ id: 'rename', label: 'Rename', icon: ICONS.rename },
	{ id: 'copy', label: 'Copy', icon: ICONS.copy },
	{ id: 'move', label: 'Move', icon: ICONS.move },
	{ id: 'delete', label: 'Delete', icon: ICONS.delete, isDanger: true }
];

export const FILE_MENU: MenuItem[] = [
	{ id: 'open', label: 'Open', icon: ICONS.open },
	{ id: 'download', label: 'Download', icon: ICONS.download },
	{ id: 'rename', label: 'Rename', icon: ICONS.rename },
	{ id: 'copy', label: 'Copy', icon: ICONS.copy },
	{ id: 'move', label: 'Move', icon: ICONS.move },
	{ id: 'delete', label: 'Delete', icon: ICONS.delete, isDanger: true }
];
