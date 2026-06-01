<script lang="ts">
	import { onMount } from 'svelte';

	import Uppy from '@uppy/core';
	import Dashboard from '@uppy/dashboard';
	import { api } from '$lib/api/client';

	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';

	let { isOpen = $bindable(false), currentFolderId } = $props();
	let uppy: typeof Uppy;

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

		uppy.addUploader(async (uploadIds) => {
			for (const fileId of uploadIds) {
				const file = uppy.getFile(fileId);
				uppy.emit('upload-started', file);

				const chunkSize = 5 * 1024 * 1024;
				const totalParts = Math.ceil(file.size / chunkSize);

				const uploadId = crypto.randomUUID();

				const uploadedParts = [];
				let bytesUploaded = 0;
				let mainChannelId = null;

				try {
					const CONCURRENCY_LIMIT = 4;
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

								fetch(url, {
									method: 'POST',
									body: chunk,
									headers: {
										'Content-Type': 'application/octet-stream'
									}
								})
									.then(async (chunkRes) => {
										if (!chunkRes.ok) throw new Error(`chunk ${partNo} failed`);
										const result = await chunkRes.json();

										uploadedParts.push({ partNo: partNo, id: result.partId });

										if (partNo === 1 && result.channelId) {
											mainChannelId = result.channelId;
										}

										bytesUploaded += chunk.size;
										uppy.emit('upload-progress', file, {
											uploader: uppy,
											bytesUploaded: bytesUploaded,
											bytesTotal: file.size
										});

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

					const finalParts = uploadedParts.map((p) => ({ id: p.id }));

					const payload: Record<string, any> = {
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

					uppy.emit('upload-success', file.id, finalData);
				} catch (err) {
					console.error('[Uploader Error]', err);
					uppy.emit('upload-error', file.id, err);
				}
			}
		});
		uppy.on('dashboard:modal-closed', () => {
			isOpen = false;
		});

		return () => {
			uppy.close({ reason: 'unmount' });
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
