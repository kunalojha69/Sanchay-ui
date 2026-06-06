<script lang="ts">
	import { api } from '$lib/api/client';
	import { fileSystem } from '$lib/state/files.svelte';
	import { toast } from 'svelte-sonner';

	let { isOpen = $bindable(false), currentFolderId = null } = $props();

	let folderName = $state('');
	let isSubmitting = $state(false);

	async function handleCreateFolder(e: Event) {
		e.preventDefault();

		const name = folderName.trim();
		if (!name) return;

		isSubmitting = true;

		try {
			// 1. Build the exact payload your Elysia backend expects
			const payload: Record<string, any> = {
				type: 'folder',
				name: name
			};

			// Only attach parentId if we are inside a folder (not at root)
			if (currentFolderId) {
				payload.parentId = currentFolderId;
			}

			// 2. Hit the database
			const newFolder = await api.post('/files', payload);

			// 3. INSTANT UI UPDATE: Push the new folder to the top of the dashboard
			fileSystem.add(newFolder);

			toast.success(`Folder "${name}" created successfully!`);
			closeModal();
		} catch (error) {
			console.error('[Create Folder Error]', error);
			toast.error('Failed to create folder. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	function closeModal() {
		isOpen = false;
		folderName = ''; // Reset input for the next time it opens
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
		aria-hidden="true"
		onclick={closeModal}
	></div>

	<div
		class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
	>
		<div class="flex flex-col space-y-1.5 text-center sm:text-left">
			<h2 class="text-lg leading-none font-semibold tracking-tight">Create New Folder</h2>
			<p class="text-sm text-muted-foreground">Enter a name for your new folder.</p>
		</div>

		<form onsubmit={handleCreateFolder}>
			<div class="grid gap-4 py-4">
				<input
					type="text"
					bind:value={folderName}
					placeholder="e.g. College Project"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					autofocus
					disabled={isSubmitting}
				/>
			</div>

			<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
				<button
					type="button"
					onclick={closeModal}
					disabled={isSubmitting}
					class="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 sm:mt-0"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={!folderName.trim() || isSubmitting}
					class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					{isSubmitting ? 'Creating...' : 'Create Folder'}
				</button>
			</div>
		</form>
	</div>
{/if}
