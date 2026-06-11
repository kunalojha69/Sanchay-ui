<script lang="ts">
	import { sizeFormat } from '$lib';
	let { data } = $props();
	const stats = $derived(data.stats);

	// --- SVG CHART MATH ---
	// 1. Find the highest Y value (upload count) to scale the chart. Minimum scale of 2.
	const maxUploads = $derived(Math.max(...stats.uploadActivity.map((d: any) => d.count), 2));

	// 2. Set internal SVG dimensions
	const svgWidth = 800;
	const svgHeight = 200;
	const paddingX = 20;
	const paddingY = 20;

	// 3. Generate exact pixel coordinates for the SVG path
	const graphPoints = $derived(
		stats.uploadActivity.map((d: any, i: number) => {
			const x = paddingX + (i / (stats.uploadActivity.length - 1)) * (svgWidth - paddingX * 2);
			const y = svgHeight - paddingY - (d.count / maxUploads) * (svgHeight - paddingY * 2);
			return { x, y, date: d.date, count: d.count, id: d.id };
		})
	);

	// 4. Create the SVG "d" attribute string (e.g., "M 10,20 L 30,40 ...")
	const pathData = $derived('M ' + graphPoints.map((p: any) => `${p.x},${p.y}`).join(' L '));
</script>

<div class="mx-auto max-w-6xl animate-in space-y-6 p-6 duration-500 fade-in">
	<div
		class="flex items-center justify-between rounded-2xl border border-border bg-card p-6 shadow-sm"
	>
		<div class="flex items-center gap-4">
			<div
				class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"
					></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"
					></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line
						x1="3"
						y1="18"
						x2="3.01"
						y2="18"
					></line></svg
				>
			</div>
			<div>
				<h2 class="text-2xl font-bold tracking-tight">Total Storage</h2>
				<p class="text-sm text-muted-foreground">Overview of your drive usage</p>
			</div>
		</div>

		<div class="flex gap-12 text-right">
			<div>
				<p class="mb-1 text-sm font-medium text-muted-foreground">Used Space</p>
				<p class="text-3xl font-bold">{sizeFormat(stats.usedSpace)}</p>
			</div>
			<div>
				<p class="mb-1 text-sm font-medium text-muted-foreground">Total Files</p>
				<p class="text-3xl font-bold">{stats.totalFiles}</p>
			</div>
		</div>
	</div>

	<div class="flex h-[400px] flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
		<div class="mb-8 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line
							x1="3"
							y1="9"
							x2="21"
							y2="9"
						></line><line x1="9" y1="21" x2="9" y2="9"></line></svg
					>
				</div>
				<h3 class="text-xl font-bold">Upload Activity</h3>
			</div>

			<button
				class="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
			>
				7 Days
			</button>
		</div>

		<div class="relative mt-4 w-full flex-1">
			<div
				class="absolute top-0 bottom-6 left-0 flex flex-col justify-between text-xs font-medium text-muted-foreground"
			>
				<span>{sizeFormat(maxUploads)}</span>
				<span>{sizeFormat(maxUploads * 0.75)}</span>
				<span>{sizeFormat(maxUploads * 0.5)}</span>
				<span>{sizeFormat(maxUploads * 0.25)}</span>
				<span>0</span>
			</div>

			<div class="relative ml-8 h-full">
				<svg
					viewBox="0 0 {svgWidth} {svgHeight}"
					class="h-full w-full overflow-visible"
					preserveAspectRatio="none"
				>
					{#each [0, 0.25, 0.5, 0.75, 1] as tick (tick)}
						<line
							x1="0"
							y1={svgHeight - paddingY - tick * (svgHeight - paddingY * 2)}
							x2={svgWidth}
							y2={svgHeight - paddingY - tick * (svgHeight - paddingY * 2)}
							stroke="currentColor"
							class="stroke-1 text-border"
							stroke-dasharray="4 4"
						/>
					{/each}

					<path
						d={pathData}
						fill="none"
						stroke="currentColor"
						class="text-primary"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>

					{#each graphPoints as point (point.id)}
						<circle
							cx={point.x}
							cy={point.y}
							r="4"
							class="fill-background stroke-primary"
							stroke-width="3"
						/>
					{/each}
				</svg>

				<div class="absolute right-0 -bottom-6 left-0 flex justify-between">
					{#each graphPoints as point (point.id)}
						<span
							class="-translate-x-1/2 transform text-xs font-medium whitespace-nowrap text-muted-foreground"
							style="position: absolute; left: {(point.x / svgWidth) * 100}%;"
						>
							{point.date}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
