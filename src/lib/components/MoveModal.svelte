<script lang="ts">
	import { api } from '$lib/api/client';
	import { fileSystem } from '$lib/state/files.svelte';
	import { modalManager } from '$lib/state/modals.svelte';
	import { toast } from 'svelte-sonner';

	let folders = $state<any[]>([]);
	let selectedFolderId = $state<string | null>(null);
	let isLoading = $state(false);
	let isMoving = $state(false);

	// Triggered automatically whenever the modal opens
	$effect(() => {
		if (modalManager.activeModal === 'move') {
			loadDestinationFolders();
		}
	});

	async function loadDestinationFolders() {
		isLoading = true;
		try {
			// Assuming your backend supports filtering by type to get just folders
			const response = await api.get<any[]>('/files?type=drive');

			// Filter out the active folder itself (you can't move a folder inside itself!)
			folders = (response || []).filter((f) => f.id !== modalManager.activeFile?.id);
		} catch (e) {
			console.error('Failed to load folders', e);
			toast.error('Failed to load folders');
		} finally {
			isLoading = false;
		}
	}

	async function handleMove(e: Event) {
		e.preventDefault();
		const file = modalManager.activeFile;
		if (!file || !selectedFolderId) return;

		isMoving = true;
		const fileId = file.id;

		try {
			// 1. Optimistic UI Update: The file is moving somewhere else, so it vanishes from the current view
			fileSystem.remove(fileId);
			modalManager.close();

			// 2. Background Database Update
			await api.patch(`/files/${fileId}`, { parentId: selectedFolderId });
			toast.success('Moved successfully');
		} catch (error) {
			console.error('[Move Error]', error);
			toast.error('Failed to move file');
		} finally {
			isMoving = false;
		}
	}
</script>

{#if modalManager.activeModal === 'move' && modalManager.activeFile}
	<div
		class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
		aria-hidden="true"
		onclick={modalManager.close}
	></div>

	<div
		class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
	>
		<div class="flex flex-col space-y-1.5">
			<h2 class="text-lg font-semibold">Move "{modalManager.activeFile.name}"</h2>
			<p class="text-sm text-muted-foreground">Select a destination folder.</p>
		</div>

		<form onsubmit={handleMove}>
			{#if isLoading}
				<div class="py-4 text-center text-sm text-muted-foreground">Loading folders...</div>
			{:else if folders.length === 0}
				<div
					class="rounded-md border border-dashed bg-muted/50 py-4 text-center text-sm text-muted-foreground"
				>
					No other folders available.
				</div>
			{:else}
				<select
					bind:value={selectedFolderId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<option value={null} disabled>Select a folder...</option>
					{#each folders as folder (folder.id)}
						<option value={folder.id}>{folder.name}</option>
					{/each}
				</select>
			{/if}

			<div class="mt-4 flex justify-end gap-2">
				<button
					type="button"
					onclick={modalManager.close}
					class="rounded-md border px-4 py-2 text-sm hover:bg-accent"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={!selectedFolderId || isMoving}
					class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					{isMoving ? 'Moving...' : 'Move Here'}
				</button>
			</div>
		</form>
	</div>
{/if}
