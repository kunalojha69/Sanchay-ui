<script lang="ts">
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { FILE_MENU, FOLDER_MENU, type MenuActionId } from '$lib/config/menus';

	let { file, onAction, children } = $props();

	const menuItems = $derived(file.type === 'folder' ? FOLDER_MENU : FILE_MENU);

	function triggerAction(id: MenuActionId) {
		onAction(id, file);
	}
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="w-full">
		{@render children()}
	</ContextMenu.Trigger>

	<ContextMenu.Content class="w-48">
		{#each menuItems as item (item.id)}
			{@const Icon = item.icon}
			<ContextMenu.Item
				onclick={() => triggerAction(item.id)}
				class="flex cursor-pointer items-center gap-2 {item.isDanger
					? 'text-red-600 focus:bg-red-100 focus:text-red-700 dark:text-red-500 dark:focus:bg-red-900/30'
					: ''}"
			>
				<Icon class="size-4" />
				{item.label}
			</ContextMenu.Item>
		{/each}
	</ContextMenu.Content>
</ContextMenu.Root>
