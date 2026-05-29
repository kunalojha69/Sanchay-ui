<script lang="ts">
	import { onMount } from 'svelte';
	import * as Command from '$lib/components/ui/command';
	import { FileText, FolderPlus, Settings, UploadIcon } from 'lucide-svelte';

	// let open = $state(false);
	let { open = $bindable(false) } = $props();

	onMount(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	});
</script>

<Command.Dialog bind:open>
	<Command.Input placeholder="Search files or run commands" />
	<Command.List>
		<Command.Empty>No Results Found</Command.Empty>

		<Command.Group heading="Quick Actions">
			<Command.Item
				onSelect={() => {
					console.log('uploading...');
					open = false;
				}}
			>
				<UploadIcon class="mr-2 h-4 w-4" />
				<span>Upload File</span>
			</Command.Item>
			<Command.Item
				onSelect={() => {
					console.log('creating folder...');
					open = false;
				}}
			>
				<FolderPlus class="mr-2 h-4 w-4" />
				<span>New Folder</span>
			</Command.Item>
		</Command.Group>

		<Command.Separator />

		<Command.Group heading="Recent Files">
			<Command.Item>
				<FileText class="mr-2 h-4 w-4 text-blue-500" />
				<span>M.Tech_Dissertation_Draft.pdf</span>
			</Command.Item>
			<Command.Item>
				<Settings class="mr-2 h-4 w-4 text-zinc-500" />
				<span>SpectraGuard_Config.json</span>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
