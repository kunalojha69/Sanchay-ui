<script lang="ts">
	import { api } from '$lib/api/client';
	import { fileSystem } from '$lib/state/files.svelte';
	import { modalManager } from '$lib/state/modals.svelte';
	import { toast } from 'svelte-sonner';

	async function handleRename(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const newName = formData.get('newName') as string;
		const file = modalManager.activeFile;

		if (!newName || !file || newName === file.name) {
			modalManager.close();
			return;
		}

		const fileId = file.id;
		const oldName = file.name;

		try {
			// 1. Optimistic UI Update
			fileSystem.update(fileId, { name: newName });
			modalManager.close();

			// 2. Background Database Update
			await api.patch(`/files/${fileId}`, { name: newName });
			toast.success('Renamed successfully');
		} catch (error) {
			// Rollback
			console.error('Error in renaming file: ', error);
			fileSystem.update(fileId, { name: oldName });
			toast.error('Failed to rename file');
		}
	}
</script>

{#if modalManager.activeModal === 'rename' && modalManager.activeFile}
	<div
		class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
		aria-hidden="true"
		onclick={modalManager.close}
	></div>

	<div
		class="fixed top-[50%] left-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
	>
		<div class="flex flex-col space-y-1.5">
			<h2 class="text-lg font-semibold">Rename</h2>
		</div>

		<form onsubmit={handleRename}>
			<input
				name="newName"
				type="text"
				defaultValue={modalManager.activeFile.name}
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				autofocus
			/>

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
					class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
				>
					Save
				</button>
			</div>
		</form>
	</div>
{/if}
