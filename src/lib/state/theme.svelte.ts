class ThemeEngine {
	mode = $state<'dark' | 'light'>('dark');
	accentColor = $state<string>('#3b82f6');
	viewType = $state<'list' | 'grid' | 'tile'>('grid');

	init(initialTheme: 'dark' | 'light') {
		this.mode = initialTheme;
	}

	toggleMode() {
		this.mode = this.mode === 'dark' ? 'light' : 'dark';

		if (this.mode === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}

		document.cookie = `theme=${this.mode}; path=/; max-age=31536000; SameSite=Lax`;
	}

	setAccent(hex: string) {
		this.accentColor = hex;
	}

	setView(type: 'list' | 'grid' | 'tile') {
		this.viewType = type;
	}
}

export const theme = new ThemeEngine();
