<script lang="ts">
	import { api } from '$lib/api/client';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	// Local reactive state so we can instantly remove items from the UI
	let trashedFiles = $derived(data.files);
	let isEmptying = $state(false);

	// Helper to format bytes cleanly
	function formatBytes(bytes: number) {
		if (!bytes) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	async function handleRestore(file: any) {
		// Optimistic UI update
		trashedFiles = trashedFiles.filter((f) => f.id !== file.id);

		try {
			// Assuming a restore endpoint. Alternatively, a PATCH to set is_deleted=false
			await api.post(`/files/trash/${file.id}/restore`, {});
			toast.success(`Restored "${file.name}"`);
		} catch (error) {
			// Rollback
			trashedFiles = [...trashedFiles, file];
			toast.error(`Failed to restore "${file.name}"`);
		}
	}

	async function handlePermanentDelete(file: any) {
		if (!confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) return;

		trashedFiles = trashedFiles.filter((f) => f.id !== file.id);

		try {
			// The actual hard delete endpoint
			await api.delete(`/files/${file.id}?permanent=true`);
			toast.success(`Permanently deleted "${file.name}"`);
		} catch (error) {
			trashedFiles = [...trashedFiles, file];
			toast.error(`Failed to delete "${file.name}"`);
		}
	}

	async function handleEmptyTrash() {
		if (!confirm('Are you sure you want to permanently delete all items in the trash?')) return;

		isEmptying = true;
		try {
			await api.delete('/files/trash/empty');
			trashedFiles = [];
			toast.success('Trash emptied successfully');
		} catch (error) {
			toast.error('Failed to empty trash');
		} finally {
			isEmptying = false;
		}
	}
</script>

<div class="mx-auto max-w-6xl animate-in space-y-6 p-6 duration-500 fade-in">
	<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
		<div>
			<h1 class="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">Trash</h1>
			<p class="mt-1 text-muted-foreground">
				Items here will be permanently deleted after 30 days.
			</p>
		</div>

		{#if trashedFiles.length > 0}
			<button
				onclick={handleEmptyTrash}
				disabled={isEmptying}
				class="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
			>
				{isEmptying ? 'Emptying...' : 'Empty Trash'}
			</button>
		{/if}
	</div>

	{#if trashedFiles.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-24 text-muted-foreground"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mb-4 opacity-50"
				><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path
					d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
				/></svg
			>
			<p class="text-lg font-medium">Trash is empty</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each trashedFiles as file (file.id)}
				<div class="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
					<div class="flex items-start gap-3">
						<span class="mt-1 text-3xl">{file.type === 'folder' ? '📁' : '📄'}</span>
						<div class="flex min-w-0 flex-1 flex-col">
							<p class="truncate text-sm font-semibold line-through opacity-70" title={file.name}>
								{file.name}
							</p>
							<p class="text-xs text-muted-foreground">
								{file.type === 'folder' ? 'Folder' : formatBytes(file.size)}
							</p>
						</div>
					</div>

					<div class="mt-auto flex gap-2 border-t border-border/50 pt-2">
						<button
							onclick={() => handleRestore(file)}
							class="flex-1 rounded-md bg-muted py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
						>
							Restore
						</button>
						<button
							onclick={() => handlePermanentDelete(file)}
							class="flex-1 rounded-md bg-muted py-1.5 text-xs font-medium transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-500"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
