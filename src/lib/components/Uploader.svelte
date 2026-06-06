<script lang="ts">
	import { onMount } from 'svelte';

	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import { api } from '$lib/api/client';
	import { toast } from 'svelte-sonner';

	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';
	import { fileSystem } from '$lib/state/files.svelte';

	let { isOpen = $bindable(false), currentFolderId } = $props();
	let uppy: Uppy;

	onMount(() => {
		uppy = new Uppy({
			id: 'cloud-uploader',
			autoProceed: false,
			restrictions: {
				maxFileSize: 2147483648
			}
		}).use(Dashboard, {
			target: 'body',
			proudlyDisplayPoweredByUppy: false,
			theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
			closeAfterFinish: true,
			closeModalOnClickOutside: true
		});

		const activeToasts: Record<string, string | number> = {};
		const lastPercentages: Record<string, number> = {};

		uppy.on('upload-started' as any, (file: any) => {
			activeToasts[file.id] = toast.loading(`Uploading ${file.name} (0%) ...`, {
				duration: Number.POSITIVE_INFINITY
			});

			lastPercentages[file.id] = 0;
			const dashboard = uppy.getPlugin('Dashboard');
			if (dashboard) {
				dashboard.closeModal();
			}
		});

		uppy.on('upload-progress', (file, progress) => {
			if (!file || !activeToasts[file.id]) return;

			const percent = Math.round((progress.bytesUploaded / (progress.bytesTotal || 1)) * 100);

			if (percent > lastPercentages[file.id]) {
				lastPercentages[file.id] = percent;
				toast.loading(`Uploading ${file.name} (${percent}%)...`, {
					id: activeToasts[file.id]
				});
			}
		});

		uppy.on('upload-success', (file, _response) => {
			if (file && activeToasts[file.id]) {
				toast.success(`${file.name} uploaded successfully!`, {
					id: activeToasts[file.id],
					duration: 4000
				});
				delete activeToasts[file.id];
				delete lastPercentages[file.id];
			}
		});

		uppy.on('upload-error', (file, _error) => {
			if (file && activeToasts[file.id]) {
				// 5. Morph the loading toast into an error toast
				toast.error(`Failed to upload ${file.name}`, {
					id: activeToasts[file.id],
					duration: 5000
				});
				delete activeToasts[file.id];
				delete lastPercentages[file.id];
			}
		});
		uppy.addUploader(async (uploadIds) => {
			for (const fileId of uploadIds) {
				const file = uppy.getFile(fileId);
				uppy.emit('upload-started' as any, file);

				const chunkSize = 5 * 1024 * 1024;
				const totalParts = Math.ceil((file.size || 0) / chunkSize);

				const uploadId = crypto.randomUUID();

				const uploadedParts = [];
				let bytesUploaded = 0;
				let mainChannelId = null;

				try {
					const CONCURRENCY_LIMIT = 3;
					let currentPartNo = 1;

					await new Promise<void>((resolve, reject) => {
						let activeUploads = 0;

						function processNextBatch() {
							if (currentPartNo > totalParts && activeUploads === 0) {
								return resolve();
							}

							while (activeUploads < CONCURRENCY_LIMIT && currentPartNo <= totalParts) {
								const partNo = currentPartNo++;
								activeUploads++;

								const start = (partNo - 1) * chunkSize;
								const end = Math.min(start + chunkSize, file.size);
								const chunk = file.data.slice(start, end);

								const url = `/api/uploads/${uploadId}?fileName=${encodeURIComponent(file.name)}&partNo=${partNo}`;

								new Promise((resolveChunk, rejectChunk) => {
									const xhr = new XMLHttpRequest();
									xhr.open('POST', url, true);
									xhr.setRequestHeader('Content-Type', 'application/octet-stream');

									let chunkLoaded = 0;

									xhr.upload.onprogress = (e) => {
										if (e.lengthComputable) {
											const delta = e.loaded - chunkLoaded;
											chunkLoaded = e.loaded;
											bytesUploaded += delta;

											uppy.emit('upload-progress', uppy.getFile(fileId), {
												bytesUploaded: bytesUploaded,
												bytesTotal: file.size
											} as any);
										}
									};

									xhr.onload = () => {
										if (xhr.status >= 200 && xhr.status <= 300) {
											const delta = chunk.size - chunkLoaded;
											if (delta > 0) {
												bytesUploaded += delta;
												uppy.emit('upload-progress', uppy.getFile(fileId), {
													bytesUploaded: bytesUploaded,
													bytesTotal: file.size
												} as any);
											}

											try {
												const result = JSON.parse(xhr.responseText);
												resolveChunk(result);
											} catch (err: any) {
												rejectChunk(new Error('Invalid JSON response from server'));
											}
										} else {
											rejectChunk(new Error(`Chunk ${partNo} failed with status ${xhr.status}`));
										}
									};

									xhr.onerror = () => rejectChunk(new Error(`Network error on chunk ${partNo}`));
									xhr.send(chunk);
								})
									.then((result: any) => {
										uploadedParts.push({ partNo: partNo, id: result.partId, size: result.size });
										if (partNo === 1 && result.channelId) {
											mainChannelId = result.channelId;
										}
										activeUploads--;
										processNextBatch();
									})
									.catch((err) => {
										reject(err);
									});
							}
						}
						processNextBatch();
					});

					uploadedParts.sort((a, b) => a.partNo - b.partNo);

					const finalParts = uploadedParts.map((p) => ({ id: p.id, size: p.size }));

					const payload: Record<string, unknown> = {
						type: 'file',
						name: file.name,
						mimeType: file.type || 'application/octet-stream',
						size: file.size,
						uploadId: uploadId,
						parts: finalParts
					};

					// Only attach these keys if they have actual truthy values
					if (mainChannelId) payload.channelId = mainChannelId;
					if (currentFolderId) payload.parentId = currentFolderId;

					const finalData = await api.post('/files', payload);

					uppy.emit('upload-success', file, finalData as any);
				} catch (err) {
					console.error('[Uploader Error]', err);
					uppy.emit('upload-error', file, err as any);
				}
			}
		});
		uppy.on('dashboard:modal-closed', () => {
			isOpen = false;
		});

		uppy.on('upload-success', (_file, response) => {
			fileSystem.add(response.body);
		});

		// uppy.on('upload', () => {
		// 	isOpen = false;
		// });

		return () => {
			uppy.destroy();
		};
	});

	$effect(() => {
		if (uppy) {
			const dashboard = uppy.getPlugin('Dashboard');
			if (dashboard) {
				if (isOpen) {
					dashboard.openModal();
				} else {
					dashboard.closeModal();
				}
			}
		}
	});
</script>
