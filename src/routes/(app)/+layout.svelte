<script lang="ts">
	import '../layout.css';
	import { theme } from '$lib/state/theme.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import Uploader from '$lib/components/Uploader.svelte';
	import {
		Folder,
		Trash2,
		Search,
		LayoutList,
		LayoutGrid,
		Sun,
		Moon,
		Settings,
		HardDrive,
		Rows3Icon,
		Upload
	} from 'lucide-svelte';

	let { children } = $props();

	// Command palette state binding
	let isSearchOpen = $state(false);
	let isUploadOpen = $state(false);

	let currentFolder = $state<string | null>(null);

	// Sync theme engine dark class on mounting and changes
	$effect(() => {
		if (theme.mode === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// Sidebar navigation links array
	const navigation = [
		{ name: 'All Files', icon: Folder, active: true },
		{ name: 'Usage', icon: HardDrive, active: false },
		{ name: 'Trash', icon: Trash2, active: false },
		{ name: 'Settings', icon: Settings, active: false }
	];
</script>

<div
	class="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground antialiased"
>
	<aside
		class="hidden h-full w-64 flex-col justify-between border-r border-border bg-card p-6 select-none md:flex"
	>
		<div class="space-y-8">
			<div class="flex items-center gap-3 px-2">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-md shadow-primary/20"
				>
					☁️
				</div>
				<span
					class="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-lg font-bold tracking-tight"
				>
					Sanchay
				</span>
			</div>

			<nav class="space-y-1.5">
				{#each navigation as item (item.name)}
					<button
						class="group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
            {item.active
							? 'bg-secondary font-semibold text-primary'
							: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
					>
						{#if item.active}
							<div class="absolute top-1/3 bottom-1/3 left-0 w-1 rounded-r-full bg-primary"></div>
						{/if}

						<item.icon
							class="h-5 w-5 transition-transform duration-200 group-hover:scale-105 {item.active
								? 'text-primary'
								: ''}"
						/>
						<span>{item.name}</span>
					</button>
				{/each}
			</nav>
		</div>

		<div class="flex flex-col gap-3 border-t border-border pt-4">
			<div class="flex items-center gap-3 px-2 py-1">
				<div
					class="from-brand-500 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr to-indigo-500 text-xs font-bold text-white shadow-sm"
				>
					KU
				</div>
				<div class="flex min-w-0 flex-col">
					<span class="truncate text-sm font-semibold">Kunal</span>
					<span class="truncate text-[11px] text-muted-foreground">mtech_student@college.edu</span>
				</div>
			</div>
		</div>
	</aside>

	<div class="flex h-full min-w-0 flex-1 flex-col bg-background">
		<header
			class="z-10 flex h-20 w-full items-center justify-between gap-4 border-b border-border bg-card/50 px-6 backdrop-blur-md select-none md:px-8"
		>
			<button
				onclick={() => (isSearchOpen = true)}
				class="group flex h-11 w-full max-w-md cursor-pointer items-center gap-2.5 rounded-full border border-border bg-muted/60 px-4 text-sm text-muted-foreground shadow-sm transition-all duration-200 hover:bg-muted focus:outline-none"
			>
				<Search
					class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
				/>
				<span class="flex-1 text-left">Search documentation, folders, and assets...</span>
				<kbd
					class="hidden items-center gap-0.5 rounded-md border border-border bg-card px-2 py-1 font-sans text-[10px] font-bold tracking-widest shadow-xs select-none sm:inline-flex"
				>
					⌘K
				</kbd>
			</button>

			<div class="flex items-center gap-4">
				<div
					class="hidden items-center gap-0.5 rounded-xl border border-border/40 bg-muted p-1 sm:flex"
				>
					<button
						onclick={() => theme.setView('list')}
						class="rounded-lg p-1.5 transition-all {theme.viewType === 'list'
							? 'bg-card text-foreground shadow-xs'
							: 'text-muted-foreground hover:text-foreground'}"
						title="List View"
					>
						<LayoutList class="h-4 w-4" />
					</button>
					<button
						onclick={() => theme.setView('grid')}
						class="rounded-lg p-1.5 transition-all {theme.viewType === 'grid'
							? 'bg-card text-foreground shadow-xs'
							: 'text-muted-foreground hover:text-foreground'}"
						title="Grid View"
					>
						<LayoutGrid class="h-4 w-4" />
					</button>
					<button
						onclick={() => theme.setView('tile')}
						class="rounded-lg p-1.5 transition-all {theme.viewType === 'tile'
							? 'bg-card text-foreground shadow-xs'
							: 'text-muted-foreground hover:text-foreground'}"
						title="Compact Tile View"
					>
						<Rows3Icon class="h-4 w-4" />
					</button>
				</div>

				<button
					onclick={() => (isUploadOpen = true)}
					class="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-98"
				>
					<Upload class="h-4 w-4" />
					<span class="hidden md:inline">Upload File</span>
				</button>

				<button
					onclick={() => theme.toggleMode()}
					class="hidden cursor-pointer items-center rounded-full border border-border bg-muted/50 p-1 transition-colors hover:bg-muted sm:flex"
				>
					<div
						class="rounded-full p-1.5 transition-all duration-300 {theme.mode === 'light'
							? 'bg-card text-foreground shadow-sm'
							: 'text-muted-foreground'}"
					>
						<Sun class="h-4 w-4" />
					</div>
					<div
						class="rounded-full p-1.5 transition-all duration-300 {theme.mode === 'dark'
							? 'bg-card text-foreground shadow-sm'
							: 'text-muted-foreground'}"
					>
						<Moon class="h-4 w-4" />
					</div>
				</button>
			</div>
		</header>

		<main class="relative flex-1 overflow-y-auto p-6 md:p-8">
			{@render children()}
		</main>
	</div>

	<Uploader bind:isOpen={isUploadOpen} currentFolderId={currentFolder} />
	<CommandPalette bind:open={isSearchOpen} />
</div>
