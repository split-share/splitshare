import { API_BASE_URL, IS_MOBILE_APP } from './config';
import { applyAction } from '$app/forms';
import type { SubmitFunction, ActionResult } from '@sveltejs/kit';

type FetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	body?: unknown;
	headers?: Record<string, string>;
};

export async function apiRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
	const { method = 'GET', body, headers = {} } = options;

	const config: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		credentials: 'include'
	};

	if (body) {
		config.body = JSON.stringify(body);
	}

	const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
	const response = await fetch(url, config);

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		const message =
			errorData && typeof errorData === 'object' && 'message' in errorData
				? String(errorData.message)
				: `HTTP ${response.status}`;
		throw new Error(message);
	}

	return response.json();
}

/**
 * Form action enhancer that works for both web and mobile.
 * On web: Uses SvelteKit's form actions normally
 * On mobile: Converts form submission to API call to backend server
 */
export function enhanceForm(options?: {
	onSubmit?: () => void;
	onResult?: (result: unknown) => void;
	onError?: (error: string) => void;
}): SubmitFunction {
	return async ({ action, formData, cancel }) => {
		if (options?.onSubmit) {
			options.onSubmit();
		}

		// On mobile, intercept and send to API backend
		if (IS_MOBILE_APP) {
			cancel();

			try {
				const body: Record<string, unknown> = {};
				formData.forEach((value, key) => {
					body[key] = value;
				});

				const actionUrl = new URL(action);
				const endpoint = actionUrl.pathname + actionUrl.search;

				const response = await fetch(`${API_BASE_URL}${endpoint}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify(body)
				});

				const result = await response.json();

				if (response.ok) {
					if (options?.onResult) {
						options.onResult(result);
					}
					const successResult: ActionResult = {
						type: 'success',
						status: response.status,
						data: result
					};
					await applyAction(successResult);
				} else {
					if (options?.onError) {
						options.onError(result.message || 'Action failed');
					}
					const failureResult: ActionResult = {
						type: 'failure',
						status: response.status,
						data: result
					};
					await applyAction(failureResult);
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Network error';
				if (options?.onError) {
					options.onError(message);
				}
				const errorResult: ActionResult = {
					type: 'error',
					error: new Error(message)
				};
				await applyAction(errorResult);
			}
		}

		return async ({ result }) => {
			if (result.type === 'success' && options?.onResult) {
				options.onResult(result.data);
			} else if (result.type === 'failure' && options?.onError) {
				options.onError(result.data?.message || 'Action failed');
			} else if (result.type === 'error' && options?.onError) {
				options.onError('An error occurred');
			}

			await applyAction(result);
		};
	};
}
