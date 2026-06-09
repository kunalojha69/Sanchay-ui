export type ModalType = 'rename' | 'delete' | 'move' | 'copy' | null;

function createModalManager() {
	let activeModal = $state<ModalType>(null);
	let activeFile = $state<any | null>(null);

	return {
		get activeModal() {
			return activeModal;
		},
		get activeFile() {
			return activeFile;
		},

		open: (type: ModalType, file: any) => {
			activeFile = file;
			activeModal = type;
		},

		close: () => {
			activeFile = null;
			activeModal = null;
		}
	};
}

export const modalManager = createModalManager();
