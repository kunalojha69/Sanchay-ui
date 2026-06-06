function createFileSystem() {
	let files = $state<any[]>([]);

	return {
		get files() {
			return files;
		},

		setFiles: (initialFiles: any[]) => {
			files = initialFiles;
		},

		add: (file: any) => {
			files.unshift(file);
		},

		remove: (id: string) => {
			files = files.filter((f) => f.id !== id);
		},

		update: (id: string, updates: Partial<any>) => {
			const index = files.findIndex((f) => f.id === id);
			if (index !== -1) {
				files[index] = { ...files[index], ...updates };
			}
		}
	};
}

export const fileSystem = createFileSystem();
