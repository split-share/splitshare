import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient } from 'better-auth/client/plugins';
import { API_BASE_URL } from './config';

export const authClient = createAuthClient({
	baseURL: API_BASE_URL,
	plugins: [
		twoFactorClient({
			onTwoFactorRedirect: () => {
				window.location.href = '/two-factor';
			}
		})
	]
});

export const { signIn, signUp, signOut, useSession } = authClient;
