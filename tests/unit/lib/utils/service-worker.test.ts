import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	registerServiceWorker,
	skipServiceWorkerWaiting,
	initializeOfflineSupport
} from '$lib/utils/service-worker';
import { serviceWorkerState } from '$lib/stores/connection.svelte';

describe('Service Worker Utilities', () => {
	let mockRegistration: {
		installing: { state: string; addEventListener: ReturnType<typeof vi.fn> } | null;
		waiting: null;
		active: { state: string } | null;
		addEventListener: ReturnType<typeof vi.fn>;
		scope: string;
	};

	beforeEach(() => {
		// Reset state
		serviceWorkerState.registered = false;
		serviceWorkerState.updateAvailable = false;
		serviceWorkerState.offlineReady = false;

		// Create mock registration
		mockRegistration = {
			installing: null,
			waiting: null,
			active: { state: 'activated' },
			addEventListener: vi.fn(),
			scope: '/'
		};

		// Reset mocks
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('registerServiceWorker', () => {
		it('should register service worker when supported', async () => {
			// Mock serviceWorker API
			const mockReady = Promise.resolve(mockRegistration);
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: mockReady,
					addEventListener: vi.fn(),
					controller: { postMessage: vi.fn() }
				},
				configurable: true
			});

			// Mock caches
			Object.defineProperty(global, 'caches', {
				value: {
					keys: vi.fn().mockResolvedValue(['cache-1'])
				},
				configurable: true
			});

			await registerServiceWorker();

			expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/service-worker.js', {
				scope: '/'
			});
			expect(serviceWorkerState.registered).toBe(true);
		});

		it('should handle service worker not supported', async () => {
			// Remove serviceWorker from navigator
			const originalServiceWorker = navigator.serviceWorker;
			Object.defineProperty(navigator, 'serviceWorker', {
				value: undefined,
				configurable: true
			});

			await expect(registerServiceWorker()).resolves.not.toThrow();
			expect(serviceWorkerState.registered).toBe(false);

			// Restore
			Object.defineProperty(navigator, 'serviceWorker', {
				value: originalServiceWorker,
				configurable: true
			});
		});

		it('should handle registration failure gracefully', async () => {
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockRejectedValue(new Error('Registration failed')),
					addEventListener: vi.fn(),
					controller: null
				},
				configurable: true
			});

			await expect(registerServiceWorker()).resolves.not.toThrow();
			expect(serviceWorkerState.registered).toBe(false);
		});

		it('should detect update availability', async () => {
			const stateChangeListeners: Array<(event: Event) => void> = [];
			const mockInstallingWorker = {
				state: 'installed',
				addEventListener: vi.fn((event: string, handler: (e: Event) => void) => {
					if (event === 'statechange') {
						stateChangeListeners.push(handler);
					}
				})
			};

			mockRegistration.installing = mockInstallingWorker;
			mockRegistration.active = { state: 'activated' }; // Already have active controller

			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: Promise.resolve(mockRegistration),
					addEventListener: vi.fn(),
					controller: { state: 'activated' } // Controller exists
				},
				configurable: true
			});

			// Track updatefound listeners
			let updateFoundHandler: (() => void) | null = null;
			mockRegistration.addEventListener = vi.fn((event: string, handler: () => void) => {
				if (event === 'updatefound') {
					updateFoundHandler = handler;
				}
			});

			await registerServiceWorker();

			// Simulate update found
			if (updateFoundHandler) {
				updateFoundHandler();
			}

			// Simulate state change to installed
			stateChangeListeners.forEach((handler) => handler(new Event('statechange')));

			expect(serviceWorkerState.updateAvailable).toBe(true);
		});

		it('should listen for messages from service worker', async () => {
			const messageListeners: Array<(event: MessageEvent) => void> = [];

			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: Promise.resolve(mockRegistration),
					addEventListener: vi.fn((event: string, handler: (e: MessageEvent) => void) => {
						if (event === 'message') {
							messageListeners.push(handler);
						}
					}),
					controller: null
				},
				configurable: true
			});

			Object.defineProperty(global, 'caches', {
				value: {
					keys: vi.fn().mockResolvedValue([])
				},
				configurable: true
			});

			await registerServiceWorker();

			// Verify listener was added
			expect(navigator.serviceWorker.addEventListener).toHaveBeenCalledWith(
				'message',
				expect.any(Function)
			);
		});

		it('should mark offline ready when caches exist', async () => {
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: Promise.resolve(mockRegistration),
					addEventListener: vi.fn(),
					controller: null
				},
				configurable: true
			});

			Object.defineProperty(global, 'caches', {
				value: {
					keys: vi.fn().mockResolvedValue(['cache-1', 'cache-2'])
				},
				configurable: true
			});

			await registerServiceWorker();

			expect(serviceWorkerState.offlineReady).toBe(true);
		});
	});

	describe('skipServiceWorkerWaiting', () => {
		it('should post skip waiting message to controller', async () => {
			const postMessageMock = vi.fn();
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					controller: { postMessage: postMessageMock }
				},
				configurable: true
			});

			await skipServiceWorkerWaiting();

			expect(postMessageMock).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
		});

		it('should do nothing when no controller exists', async () => {
			Object.defineProperty(navigator, 'serviceWorker', {
				value: { controller: null },
				configurable: true
			});

			await expect(skipServiceWorkerWaiting()).resolves.not.toThrow();
		});
	});

	describe('initializeOfflineSupport', () => {
		beforeEach(() => {
			// Mock window
			Object.defineProperty(global, 'window', {
				value: {
					addEventListener: vi.fn(),
					removeEventListener: vi.fn()
				},
				configurable: true
			});
		});

		it('should return cleanup function', () => {
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: Promise.resolve(mockRegistration),
					addEventListener: vi.fn()
				},
				configurable: true
			});

			Object.defineProperty(global, 'caches', {
				value: {
					keys: vi.fn().mockResolvedValue([])
				},
				configurable: true
			});

			const cleanup = initializeOfflineSupport();
			expect(typeof cleanup).toBe('function');
		});

		it('should initialize connection monitoring', () => {
			Object.defineProperty(navigator, 'serviceWorker', {
				value: {
					register: vi.fn().mockResolvedValue(mockRegistration),
					ready: Promise.resolve(mockRegistration),
					addEventListener: vi.fn()
				},
				configurable: true
			});

			Object.defineProperty(global, 'caches', {
				value: {
					keys: vi.fn().mockResolvedValue([])
				},
				configurable: true
			});

			initializeOfflineSupport();
			// Connection monitoring adds online/offline listeners
			expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
		});

		it('should return noop cleanup when window is undefined', () => {
			Object.defineProperty(global, 'window', {
				value: undefined,
				configurable: true
			});

			const cleanup = initializeOfflineSupport();
			expect(typeof cleanup).toBe('function');
			expect(() => cleanup()).not.toThrow();
		});
	});
});
