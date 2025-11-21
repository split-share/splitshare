import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '$lib/services/auth/auth.service';
import type { AuthRepository } from '$lib/services/auth/auth.repository';
import type { User, CreateUserInput, UpdateUserInput } from '$lib/services/auth/types';

describe('AuthService', () => {
	let service: AuthService;
	let mockRepository: AuthRepository;

	const mockUser: User = {
		id: '1',
		name: 'Test User',
		email: 'test@example.com',
		emailVerified: false,
		image: null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	beforeEach(() => {
		mockRepository = {
			findById: vi.fn(),
			findByEmail: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			verifyEmail: vi.fn(),
			exists: vi.fn(),
			emailExists: vi.fn()
		} as unknown as AuthRepository;

		service = new AuthService(mockRepository);
	});

	describe('getUserById', () => {
		it('should return user when found', async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(mockUser);

			const result = await service.getUserById('1');

			expect(result).toEqual(mockUser);
			expect(mockRepository.findById).toHaveBeenCalledWith('1');
		});

		it('should return undefined when user not found', async () => {
			vi.mocked(mockRepository.findById).mockResolvedValue(undefined);

			const result = await service.getUserById('999');

			expect(result).toBeUndefined();
		});
	});

	describe('getUserByEmail', () => {
		it('should return user when found by email', async () => {
			vi.mocked(mockRepository.findByEmail).mockResolvedValue(mockUser);

			const result = await service.getUserByEmail('test@example.com');

			expect(result).toEqual(mockUser);
			expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
		});
	});

	describe('createUser', () => {
		const createInput: CreateUserInput = {
			name: 'New User',
			email: 'new@example.com',
			password: 'password123'
		};

		it('should create user when email does not exist', async () => {
			vi.mocked(mockRepository.emailExists).mockResolvedValue(false);
			vi.mocked(mockRepository.create).mockResolvedValue(mockUser);

			const result = await service.createUser(createInput);

			expect(result).toEqual(mockUser);
			expect(mockRepository.emailExists).toHaveBeenCalledWith(createInput.email);
			expect(mockRepository.create).toHaveBeenCalledWith(createInput);
		});

		it('should throw error when email already exists', async () => {
			vi.mocked(mockRepository.emailExists).mockResolvedValue(true);

			await expect(service.createUser(createInput)).rejects.toThrow('Email already exists');
			expect(mockRepository.create).not.toHaveBeenCalled();
		});
	});

	describe('updateUser', () => {
		const updateInput: UpdateUserInput = {
			name: 'Updated Name'
		};

		it('should update user when exists', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.update).mockResolvedValue(mockUser);

			const result = await service.updateUser('1', updateInput);

			expect(result).toEqual(mockUser);
			expect(mockRepository.exists).toHaveBeenCalledWith('1');
			expect(mockRepository.update).toHaveBeenCalledWith('1', updateInput);
		});

		it('should throw error when user does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.updateUser('999', updateInput)).rejects.toThrow('User not found');
		});

		it('should throw error when updating to existing email', async () => {
			const updateWithEmail: UpdateUserInput = { email: 'existing@example.com' };
			const existingUser = { ...mockUser, id: '2', email: 'existing@example.com' };

			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.emailExists).mockResolvedValue(true);
			vi.mocked(mockRepository.findByEmail).mockResolvedValue(existingUser);

			await expect(service.updateUser('1', updateWithEmail)).rejects.toThrow(
				'Email already exists'
			);
		});

		it('should allow updating to own email', async () => {
			const updateWithEmail: UpdateUserInput = { email: mockUser.email };

			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.emailExists).mockResolvedValue(true);
			vi.mocked(mockRepository.findByEmail).mockResolvedValue(mockUser);
			vi.mocked(mockRepository.update).mockResolvedValue(mockUser);

			const result = await service.updateUser('1', updateWithEmail);

			expect(result).toEqual(mockUser);
		});
	});

	describe('deleteUser', () => {
		it('should delete user when exists', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

			await service.deleteUser('1');

			expect(mockRepository.exists).toHaveBeenCalledWith('1');
			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should throw error when user does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.deleteUser('999')).rejects.toThrow('User not found');
		});
	});

	describe('verifyEmail', () => {
		it('should verify email when user exists', async () => {
			const verifiedUser = { ...mockUser, emailVerified: true };
			vi.mocked(mockRepository.exists).mockResolvedValue(true);
			vi.mocked(mockRepository.verifyEmail).mockResolvedValue(verifiedUser);

			const result = await service.verifyEmail('1');

			expect(result).toEqual(verifiedUser);
			expect(mockRepository.verifyEmail).toHaveBeenCalledWith('1');
		});

		it('should throw error when user does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			await expect(service.verifyEmail('999')).rejects.toThrow('User not found');
		});
	});

	describe('userExists', () => {
		it('should return true when user exists', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(true);

			const result = await service.userExists('1');

			expect(result).toBe(true);
		});

		it('should return false when user does not exist', async () => {
			vi.mocked(mockRepository.exists).mockResolvedValue(false);

			const result = await service.userExists('999');

			expect(result).toBe(false);
		});
	});
});
