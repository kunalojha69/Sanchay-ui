<script lang="ts">
	import { api } from '$lib/api/client';
	import { fileSystem } from '$lib/state/files.svelte';
	import { modalManager } from '$lib/state/modals.svelte';
	import { toast } from 'svelte-sonner';

	let isDeleting = $state(false);

	async function handleDelete() {
		const file = modalManager.activeFile;
		if (!file) return;

		isDeleting = true;
		const fileId = file.id;

		try {
			// 1. Optimistic UI Update: Instantly vanish it from the dashboard
			fileSystem.remove(fileId);
			modalManager.close();

			// 2. Background Database Update
			await api.delete(`/files/${fileId}`);
			toast.success(`Deleted "${file.name}"`);
		} catch (error) {
			console.error('[Delete Error]', error);
			toast.error('Failed to delete file. Please refresh.');
			// Note: If this fails, the safest rollback is usually a hard refresh
			// or re-fetching the folder data, rather than trying to perfectly re-insert it.
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if modalManager.activeModal === 'delete' && modalManager.activeFile}
	<div
		class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
		aria-hidden="true"
		onclick={modalManager.close}
	></div>

	<div
		class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
	>
		<div class="flex flex-col space-y-1.5">
			<h2 class="text-lg font-semibold text-red-600 dark:text-red-500">Delete File</h2>
			<p class="text-sm text-muted-foreground">
				Are you sure you want to delete <strong>{modalManager.activeFile.name}</strong>?
			</p>
		</div>

		<div class="mt-4 flex justify-end gap-2">
			<button
				type="button"
				onclick={modalManager.close}
				disabled={isDeleting}
				class="rounded-md border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleDelete}
				disabled={isDeleting}
				class="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
			>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</button>
		</div>
	</div>
{/if}
