<script lang="ts">
	import { theme } from '$lib/state/theme.svelte';
	import { getFileStyles } from '$lib/fileStyles';
	import { dateFormat, sizeFormat } from '$lib/utils.js';
	import { fileSystem } from '$lib/state/files.svelte.js';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ActionMenu from '$lib/components/ActionMenu.svelte';
	import { toast } from 'svelte-sonner';
	import { modalManager } from '$lib/state/modals.svelte.js';
	let { data } = $props();

	let files = $derived(fileSystem.files);

	$effect(() => {
		if (data.files) {
			fileSystem.setFiles(data.files);
		}
	});

	let currentFolderId = $derived(page.url.searchParams.get('folder'));

	function handleMenuAction(actionId: string, file: any) {
		if (actionId === 'download') {
			window.location.href = `/api/files/${file.id}/content?download=1`;
			toast.success(`Downloading ${file.name}...`);
			return;
		}

		modalManager.open(actionId as any, file);
	}
</script>

<div class="mx-auto flex h-full w-full max-w-[1600px] flex-col space-y-6">
	{#if currentFolderId}
		<div class="mb-6 flex items-center gap-2">
			<a
				href={resolve('/(app)')}
				class="flex items-center gap-1 rounded-lg bg-muted/50 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg
				>
				Back to Root
			</a>
		</div>
	{/if}
	<div
		class="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm"
	>
		<div class="mb-6 flex shrink-0 items-center justify-between">
			<h3 class="text-lg font-bold">My Files</h3>
			<span class="text-sm font-medium text-muted-foreground">{files?.length || 0} items</span>
		</div>

		<div class="flex-1 overflow-y-auto pr-2">
			{#if theme.viewType === 'list'}
				{@render listView(files || [])}
			{:else if theme.viewType === 'grid'}
				{@render gridView(files || [])}
			{:else}
				{@render tileView(files || [])}
			{/if}

			{#if data.error}
				<div
					class="col-span-full rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500"
				>
					{data.error}
				</div>
			{/if}
		</div>
	</div>
</div>

{#snippet listView(files: any[])}
	<div class="w-full text-left">
		<div
			class="mb-2 grid grid-cols-12 px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
		>
			<div class="col-span-5">Name</div>
			<div class="col-span-2">Size</div>
			<div class="col-span-2">Date Modified</div>
		</div>

		<div class="space-y-1">
			{#each files as file (file.id)}
				{@const style = getFileStyles(file.type, file.mimeType)}
				{@const isFolder = file.type === 'folder'}

				<ActionMenu {file} onAction={handleMenuAction}>
					<svelte:element
						this={isFolder ? 'a' : 'div'}
						href={isFolder ? resolve(`/?folder=${file.id}`) : undefined}
						class="group grid cursor-pointer grid-cols-12 items-center rounded-2xl px-4 py-3.5 transition-colors hover:bg-muted/50"
					>
						<div class="col-span-5 flex items-center gap-3">
							<div
								class="h-10 w-10 rounded-xl {style.bg} flex items-center justify-center {style.color} shrink-0"
							>
								<style.icon class="h-5 w-5" />
							</div>
							<span
								class="truncate pr-4 text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
								>{file.name}</span
							>
						</div>

						<div class="col-span-2 text-sm font-medium text-muted-foreground">
							{sizeFormat(file.size)}
						</div>
						<div class="col-span-2 text-sm font-medium text-muted-foreground">
							{dateFormat(file.updatedAt)}
						</div>
					</svelte:element>
				</ActionMenu>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet gridView(files: any[])}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
		{#each files as file (file.id)}
			{@const style = getFileStyles(file.type, file.mimeType)}
			{@const isFolder = file.type === 'folder'}
			<ActionMenu {file} onAction={handleMenuAction}>
				<svelte:element
					this={isFolder ? 'a' : 'div'}
					href={isFolder ? resolve(`/?folder=${file.id}`) : undefined}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
				>
					<div
						class="h-16 w-16 rounded-2xl {style.bg} flex items-center justify-center {style.color} mb-4"
					>
						<style.icon class="h-8 w-8" />
					</div>
					<span class="w-full truncate text-center text-sm font-medium text-foreground"
						>{file.name}</span
					>
					<span class="mt-1 text-xs text-muted-foreground">{sizeFormat(file.size)}</span>
				</svelte:element>
			</ActionMenu>
		{/each}
	</div>
{/snippet}

{#snippet tileView(files: any[])}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each files as file (file.id)}
			{@const style = getFileStyles(file.type, file.mimeType)}
			{@const isFolder = file.type === 'folder'}

			<ActionMenu {file} onAction={handleMenuAction}>
				<svelte:element
					this={isFolder ? 'a' : 'div'}
					href={isFolder ? resolve(`/?folder=${file.id}`) : undefined}
					class="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
				>
					<div
						class="h-12 w-12 rounded-xl {style.bg} flex items-center justify-center {style.color} shrink-0"
					>
						<style.icon class="h-6 w-6" />
					</div>
					<div class="flex min-w-0 flex-1 flex-col">
						<span
							class="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
							>{file.name}</span
						>
						<div class="mt-0.5 flex items-center gap-2">
							<span class="text-[11px] font-medium text-muted-foreground"
								>{sizeFormat(file.size)}</span
							>
							<span class="h-1 w-1 rounded-full bg-muted"></span>
							<span class="text-[11px] font-medium text-muted-foreground"
								>{dateFormat(file.updatedAt)}</span
							>
						</div>
					</div>
				</svelte:element>
			</ActionMenu>
		{/each}
	</div>
{/snippet}
