<script lang="ts">
	import { Cloud, ArrowRight, Loader2, AlertCircle, Phone, MessageSquareCode } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import '../../layout.css';
	// State machine for the Telegram Auth Flow
	let step = $state<'phone' | 'code'>('phone');
	let isLoading = $state(false);
	let errorMessage = $state('');

	// Form Data
	let phoneNumber = $state('');
	let phoneCode = $state('');

	// Step 1: Ask Bun to trigger Telegram's sendCode
	async function requestTelegramCode(event: SubmitEvent) {
		event.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			// Assuming your backend has an endpoint to initiate the Telegram session
			const response = await fetch('/api/auth/send-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone: phoneNumber })
			});

			if (response.ok) {
				step = 'code'; // Slide the UI over to the code input
			} else {
				errorMessage = 'Failed to send code. Please check your phone number.';
			}
		} catch (error) {
			errorMessage = 'Could not reach the authentication server.';
		} finally {
			isLoading = false;
		}
	}

	// Step 2: Submit the code to finalize the session
	async function verifyAndLogin(event: SubmitEvent) {
		event.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone: phoneNumber, code: phoneCode })
			});

			if (response.ok) {
				// Success! Your endpoint sets the HttpOnly cookie and returns NO body.
				// We safely bypass response.json() and route directly to the dashboard.
				await goto('/');
			} else {
				// Only attempt to parse JSON on an error state, if your backend sends it
				const errorData = await response.json().catch(() => ({}));
				errorMessage = errorData.message || 'Invalid verification code.';
			}
		} catch (error) {
			errorMessage = 'Connection interrupted during verification.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4 font-sans text-foreground"
>
	<div
		class="pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-500/5 blur-[120px]"
	></div>

	<div
		class="relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5"
	>
		<div class="mb-8 flex flex-col items-center">
			<div
				class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2AABEE] font-bold text-white shadow-lg shadow-[#2AABEE]/20"
			>
				<Cloud class="h-7 w-7" />
			</div>
			<h1 class="mb-1 text-2xl font-bold tracking-tight">Cloudy Store</h1>
			<p class="text-center text-sm text-muted-foreground">
				{step === 'phone'
					? 'Enter your Telegram number to sync your cloud.'
					: 'Enter the code sent to your Telegram app.'}
			</p>
		</div>

		{#if errorMessage}
			<div
				class="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive transition-all"
			>
				<AlertCircle class="h-4 w-4 shrink-0" />
				<span>{errorMessage}</span>
			</div>
		{/if}

		{#if step === 'phone'}
			<form
				onsubmit={requestTelegramCode}
				class="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4"
			>
				<div class="space-y-1.5">
					<label for="phone" class="ml-1 text-sm font-semibold">Phone Number</label>
					<div class="relative">
						<Phone class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							id="phone"
							type="tel"
							bind:value={phoneNumber}
							placeholder="+1 (555) 000-0000"
							required
							disabled={isLoading}
							class="h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2AABEE] font-bold text-white shadow-md shadow-[#2AABEE]/20 transition-all hover:bg-[#2298D6] hover:shadow-lg hover:shadow-[#2AABEE]/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
				>
					{#if isLoading}
						<Loader2 class="h-5 w-5 animate-spin" />
						<span>Connecting...</span>
					{:else}
						<span>Send Code</span>
						<ArrowRight class="h-4 w-4" />
					{/if}
				</button>
			</form>
		{:else}
			<form
				onsubmit={verifyAndLogin}
				class="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4"
			>
				<div class="space-y-1.5">
					<label for="code" class="ml-1 text-sm font-semibold">Verification Code</label>
					<div class="relative">
						<MessageSquareCode
							class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<input
							id="code"
							type="text"
							bind:value={phoneCode}
							placeholder="12345"
							required
							disabled={isLoading}
							autocomplete="one-time-code"
							class="h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 font-mono text-lg tracking-widest transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50"
						/>
					</div>
				</div>

				<div class="mt-4 flex gap-3">
					<button
						type="button"
						onclick={() => (step = 'phone')}
						disabled={isLoading}
						class="flex h-12 items-center justify-center rounded-xl bg-muted px-4 font-bold text-foreground transition-all hover:bg-muted/80 disabled:opacity-50"
					>
						Back
					</button>
					<button
						type="submit"
						disabled={isLoading || phoneCode.length < 5}
						class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
					>
						{#if isLoading}
							<Loader2 class="h-5 w-5 animate-spin" />
						{:else}
							<span>Verify & Login</span>
						{/if}
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
