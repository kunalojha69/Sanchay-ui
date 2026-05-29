class ThemeEngine {
	mode = $state<'dark' | 'light'>('dark');
	accentColor = $state<string>('#3b82f6');
	viewType = $state<'list' | 'grid' | 'tile'>('grid');

	toggleMode() {
		this.mode = this.mode === 'dark' ? 'light' : 'dark';
		// save to local storage here
	}

	setAccent(hex: string) {
		this.accentColor = hex;
	}

	setView(type: 'list' | 'grid' | 'tile') {
		this.viewType = type;
	}
}

export const theme = new ThemeEngine();
