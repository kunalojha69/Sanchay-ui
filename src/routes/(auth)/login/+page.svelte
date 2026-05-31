<script lang="ts">
	import {
		Cloud,
		ArrowRight,
		Loader2,
		AlertCircle,
		Phone,
		MessageSquareCode,
		KeyRound
	} from 'lucide-svelte';
	import '../../layout.css';
	import { api } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	type AuthStep = 'phone' | 'polling' | 'code' | 'password';
	let step = $state<AuthStep>('phone');
	let attemptId = $state<string | null>(null);
	let errorMessage = $state('');

	let phoneNumber = $state('');
	let authCode = $state('');
	let cloudPassword = $state('');

	$effect(() => {
		let poller: ReturnType<typeof setInterval>;

		if (step === 'polling' && attemptId) {
			poller = setInterval(async () => {
				try {
					const res = await api.get<any>(`/auth/attempts/${attemptId}`);

					if (res.state === 'code_sent') {
						step = 'code';
					} else if (res.state === 'password_required') {
						step = 'password';
					} else if (res.state === 'authenticated') {
						clearInterval(poller);

						try {
							// 2. The Handshake: Pass the Telegram session to Elysia to get your JWT cookies
							// Note: Your Elysia schema requires userId, name, and userName.
							// Make sure your backend GET /attempts/:id endpoint includes these in the response!
							await api.post('/auth/login', {
								session: res.session.session,
								userId: res.session.userId, // Must be provided by the attempt response
								name: res.session.name, // Must be provided by the attempt response
								userName: res.session.userName, // Must be provided by the attempt response
								isPremium: res.session.isPremium || false
							});

							// 3. Cookies are set (204 No Content), route to the dashboard
							await goto(resolve('/(app)'));
						} catch (loginError: any) {
							errorMessage = loginError.message || 'Failed to finalize session.';
							step = 'phone';
						}
					}
				} catch (err: any) {
					clearInterval(poller);
					errorMessage = err.message || 'Polling failed. Please try again';
					step = 'phone';
				}
			}, 2000);
		}

		return () => {
			if (poller) clearInterval(poller);
		};
	});

	async function startAttempt(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		step = 'polling';

		try {
			const res = await api.post<any>(`/auth/attempts`, { authType: 'phone' });
			attemptId = res.id;
			generateCode(e);
		} catch (error: any) {
			errorMessage = error.message || 'Could not start authentication';
			step = 'phone';
		}
	}

	async function generateCode(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		const previousStep = step;
		step = 'polling';

		try {
			const res = await api.post<any>(`/auth/attempts/${attemptId}/phone/send-code`, {
				phoneNo: phoneNumber
			});
			if (res.ok) {
				return;
			}
		} catch (error: any) {
			errorMessage = error.message || 'Error in generating code';
			step = previousStep;
		}
	}

	async function submitCode(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		const previousStep = step;
		step = 'polling';

		try {
			await api.post(`/auth/attempts/${attemptId}/phone/sign-in`, { phoneCode: authCode });
			// We don't change the step here! The poller will pick up the new status
			// and automatically move us to 'password' or 'authenticated'.
		} catch (error: any) {
			errorMessage = error.message || 'Invalid verification code.';
			step = previousStep;
		}
	}

	async function submitPassword(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		const previousStep = step;
		step = 'polling';

		try {
			await api.post(`/auth/attempts/${attemptId}/password`, { password: cloudPassword });
			// Poller handles the success state
		} catch (error: any) {
			errorMessage = error.message || 'Incorrect 2FA password.';
			step = previousStep;
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
			<h1 class="mb-1 text-2xl font-bold tracking-tight">Sanchay</h1>
			<p class="text-center text-sm text-muted-foreground">
				{#if step === 'phone'}
					Enter your Telegram number to connect.
				{:else if step === 'code'}
					Enter the code sent to your Telegram app.
				{:else if step === 'password'}
					Enter your Two-Step Verification password.
				{:else}
					Communicating with Telegram...
				{/if}
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
			{@render phoneForm()}
		{:else if step === 'code'}
			{@render codeForm()}
		{:else if step === 'password'}
			{@render passwordForm()}
		{:else if step === 'polling'}
			<div class="flex animate-in flex-col items-center justify-center space-y-4 py-8 fade-in">
				<Loader2 class="h-10 w-10 animate-spin text-[#2AABEE]" />
				<p class="text-sm font-medium text-muted-foreground">Waiting for response...</p>
			</div>
		{/if}
	</div>
</div>

{#snippet phoneForm()}
	<form
		onsubmit={startAttempt}
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
					class="h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
				/>
			</div>
		</div>
		<button
			type="submit"
			class="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2AABEE] font-bold text-white shadow-md transition-all hover:bg-[#2298D6] active:scale-[0.98]"
		>
			<span>Send Code</span><ArrowRight class="h-4 w-4" />
		</button>
	</form>
{/snippet}

{#snippet codeForm()}
	<form
		onsubmit={submitCode}
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
					bind:value={authCode}
					placeholder="12345"
					required
					autocomplete="one-time-code"
					class="h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 font-mono text-lg tracking-widest transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
				/>
			</div>
		</div>
		<button
			type="submit"
			disabled={authCode.length < 5}
			class="mt-4 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
		>
			Submit Code
		</button>
	</form>
{/snippet}

{#snippet passwordForm()}
	<form
		onsubmit={submitPassword}
		class="animate-in space-y-5 duration-300 fade-in slide-in-from-right-4"
	>
		<div class="space-y-1.5">
			<label for="password" class="ml-1 text-sm font-semibold">Two-Step Verification</label>
			<div class="relative">
				<KeyRound class="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					id="password"
					type="password"
					bind:value={cloudPassword}
					placeholder="Cloud Password"
					required
					class="h-12 w-full rounded-xl border border-border bg-background pr-4 pl-11 transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
				/>
			</div>
		</div>
		<button
			type="submit"
			class="mt-4 h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
		>
			Unlock Storage
		</button>
	</form>
{/snippet}
