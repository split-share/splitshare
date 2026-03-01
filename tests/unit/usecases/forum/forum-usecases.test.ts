import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTopicUseCase } from '../../../../src/core/usecases/forum/create-topic.usecase';
import { CreatePostUseCase } from '../../../../src/core/usecases/forum/create-post.usecase';
import { DeletePostUseCase } from '../../../../src/core/usecases/forum/delete-post.usecase';
import { DeleteTopicUseCase } from '../../../../src/core/usecases/forum/delete-topic.usecase';
import { UpdatePostUseCase } from '../../../../src/core/usecases/forum/update-post.usecase';
import { UpdateTopicUseCase } from '../../../../src/core/usecases/forum/update-topic.usecase';
import { GetTopicUseCase } from '../../../../src/core/usecases/forum/get-topic.usecase';
import { GetCategoriesUseCase } from '../../../../src/core/usecases/forum/get-categories.usecase';
import { GetPostsUseCase } from '../../../../src/core/usecases/forum/get-posts.usecase';
import { GetTopicsUseCase } from '../../../../src/core/usecases/forum/get-topics.usecase';
import { GetCategoryBySlugUseCase } from '../../../../src/core/usecases/forum/get-category-by-slug.usecase';
import { IsTopicLockedUseCase } from '../../../../src/core/usecases/forum/is-topic-locked.usecase';
import type { IForumRepository } from '../../../../src/core/ports/repositories/forum.repository.port';

function createMockForumRepository(): IForumRepository {
	return {
		findAllCategories: vi.fn(),
		findCategoryBySlug: vi.fn(),
		findCategoriesWithStats: vi.fn(),
		findTopicById: vi.fn(),
		findTopicsWithFilters: vi.fn(),
		createTopic: vi.fn(),
		updateTopic: vi.fn(),
		deleteTopic: vi.fn(),
		incrementViewCount: vi.fn(),
		topicExists: vi.fn(),
		isTopicOwnedByUser: vi.fn(),
		isTopicLocked: vi.fn(),
		findPostsByTopicId: vi.fn(),
		createPost: vi.fn(),
		updatePost: vi.fn(),
		deletePost: vi.fn(),
		postExists: vi.fn(),
		isPostOwnedByUser: vi.fn()
	};
}

const mockTopic = {
	id: 'topic-1',
	categoryId: 'cat-1',
	userId: 'user-1',
	title: 'Test Topic',
	content: 'Test content',
	isPinned: false,
	isLocked: false,
	viewCount: 0,
	postCount: 1,
	createdAt: new Date(),
	updatedAt: new Date(),
	author: { id: 'user-1', name: 'Test User', image: null },
	category: { id: 'cat-1', name: 'General', slug: 'general' }
};

const mockPost = {
	id: 'post-1',
	topicId: 'topic-1',
	userId: 'user-1',
	content: 'Test post',
	createdAt: new Date(),
	updatedAt: new Date(),
	author: { id: 'user-1', name: 'Test User', image: null }
};

const mockCategory = {
	id: 'cat-1',
	name: 'General',
	slug: 'general',
	description: null,
	icon: 'message-circle',
	order: 1,
	createdAt: new Date()
};

describe('CreateTopicUseCase', () => {
	let repo: IForumRepository;
	let useCase: CreateTopicUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new CreateTopicUseCase(repo);
	});

	it('should create a topic after resolving category slug', async () => {
		vi.mocked(repo.findCategoryBySlug).mockResolvedValue(mockCategory);
		vi.mocked(repo.createTopic).mockResolvedValue(mockTopic);

		const result = await useCase.execute({
			categoryId: 'general',
			userId: 'user-1',
			title: 'Test Topic',
			content: 'Test content'
		});

		expect(repo.findCategoryBySlug).toHaveBeenCalledWith('general');
		expect(repo.createTopic).toHaveBeenCalledWith({
			categoryId: 'cat-1',
			userId: 'user-1',
			title: 'Test Topic',
			content: 'Test content'
		});
		expect(result).toEqual(mockTopic);
	});

	it('should throw NotFoundError if category does not exist', async () => {
		vi.mocked(repo.findCategoryBySlug).mockResolvedValue(undefined);

		await expect(
			useCase.execute({ categoryId: 'nonexistent', userId: 'user-1', title: 'T', content: 'C' })
		).rejects.toThrow('Category not found');
	});
});

describe('CreatePostUseCase', () => {
	let repo: IForumRepository;
	let useCase: CreatePostUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new CreatePostUseCase(repo);
	});

	it('should create a post in an unlocked topic', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicLocked).mockResolvedValue(false);
		vi.mocked(repo.createPost).mockResolvedValue(mockPost);

		const input = { topicId: 'topic-1', userId: 'user-1', content: 'Test post' };
		const result = await useCase.execute(input);

		expect(repo.topicExists).toHaveBeenCalledWith('topic-1');
		expect(repo.isTopicLocked).toHaveBeenCalledWith('topic-1');
		expect(repo.createPost).toHaveBeenCalledWith(input);
		expect(result).toEqual(mockPost);
	});

	it('should throw NotFoundError if topic does not exist', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(false);

		await expect(
			useCase.execute({ topicId: 'topic-1', userId: 'user-1', content: 'C' })
		).rejects.toThrow("Topic with id 'topic-1' not found");
	});

	it('should throw BusinessRuleError if topic is locked', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicLocked).mockResolvedValue(true);

		await expect(
			useCase.execute({ topicId: 'topic-1', userId: 'user-1', content: 'C' })
		).rejects.toThrow('This topic is locked and cannot accept new posts');
	});
});

describe('DeletePostUseCase', () => {
	let repo: IForumRepository;
	let useCase: DeletePostUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new DeletePostUseCase(repo);
	});

	it('should delete a post owned by the user', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(true);
		vi.mocked(repo.isPostOwnedByUser).mockResolvedValue(true);

		await useCase.execute('post-1', 'user-1');

		expect(repo.deletePost).toHaveBeenCalledWith('post-1');
	});

	it('should throw NotFoundError if post does not exist', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(false);

		await expect(useCase.execute('post-1', 'user-1')).rejects.toThrow(
			"Post with id 'post-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the post', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(true);
		vi.mocked(repo.isPostOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('post-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this post'
		);
	});
});

describe('DeleteTopicUseCase', () => {
	let repo: IForumRepository;
	let useCase: DeleteTopicUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new DeleteTopicUseCase(repo);
	});

	it('should delete a topic owned by the user', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicOwnedByUser).mockResolvedValue(true);

		await useCase.execute('topic-1', 'user-1');

		expect(repo.deleteTopic).toHaveBeenCalledWith('topic-1');
	});

	it('should throw NotFoundError if topic does not exist', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(false);

		await expect(useCase.execute('topic-1', 'user-1')).rejects.toThrow(
			"Topic with id 'topic-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the topic', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('topic-1', 'user-2')).rejects.toThrow(
			'Not authorized to delete this topic'
		);
	});
});

describe('UpdatePostUseCase', () => {
	let repo: IForumRepository;
	let useCase: UpdatePostUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new UpdatePostUseCase(repo);
	});

	it('should update a post owned by the user', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(true);
		vi.mocked(repo.isPostOwnedByUser).mockResolvedValue(true);
		vi.mocked(repo.updatePost).mockResolvedValue({ ...mockPost, content: 'Updated' });

		const result = await useCase.execute('post-1', 'user-1', { content: 'Updated' });

		expect(repo.updatePost).toHaveBeenCalledWith('post-1', { content: 'Updated' });
		expect(result.content).toBe('Updated');
	});

	it('should throw NotFoundError if post does not exist', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(false);

		await expect(useCase.execute('post-1', 'user-1', { content: 'X' })).rejects.toThrow(
			"Post with id 'post-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the post', async () => {
		vi.mocked(repo.postExists).mockResolvedValue(true);
		vi.mocked(repo.isPostOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('post-1', 'user-2', { content: 'X' })).rejects.toThrow(
			'Not authorized to update this post'
		);
	});
});

describe('UpdateTopicUseCase', () => {
	let repo: IForumRepository;
	let useCase: UpdateTopicUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new UpdateTopicUseCase(repo);
	});

	it('should update a topic owned by the user', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicOwnedByUser).mockResolvedValue(true);
		vi.mocked(repo.updateTopic).mockResolvedValue({ ...mockTopic, title: 'Updated' });

		const result = await useCase.execute('topic-1', 'user-1', { title: 'Updated' });

		expect(repo.updateTopic).toHaveBeenCalledWith('topic-1', { title: 'Updated' });
		expect(result.title).toBe('Updated');
	});

	it('should throw NotFoundError if topic does not exist', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(false);

		await expect(useCase.execute('topic-1', 'user-1', { title: 'X' })).rejects.toThrow(
			"Topic with id 'topic-1' not found"
		);
	});

	it('should throw ForbiddenError if user does not own the topic', async () => {
		vi.mocked(repo.topicExists).mockResolvedValue(true);
		vi.mocked(repo.isTopicOwnedByUser).mockResolvedValue(false);

		await expect(useCase.execute('topic-1', 'user-2', { title: 'X' })).rejects.toThrow(
			'Not authorized to update this topic'
		);
	});
});

describe('GetTopicUseCase', () => {
	let repo: IForumRepository;
	let useCase: GetTopicUseCase;

	beforeEach(() => {
		repo = createMockForumRepository();
		useCase = new GetTopicUseCase(repo);
	});

	it('should return the topic and increment view count', async () => {
		vi.mocked(repo.findTopicById).mockResolvedValue(mockTopic);

		const result = await useCase.execute('topic-1');

		expect(result).toEqual(mockTopic);
		expect(repo.incrementViewCount).toHaveBeenCalledWith('topic-1');
	});

	it('should throw NotFoundError if topic does not exist', async () => {
		vi.mocked(repo.findTopicById).mockResolvedValue(undefined);

		await expect(useCase.execute('topic-1')).rejects.toThrow("Topic with id 'topic-1' not found");
	});
});

describe('GetCategoriesUseCase', () => {
	it('should delegate to findCategoriesWithStats', async () => {
		const repo = createMockForumRepository();
		const mockCategories = [{ ...mockCategory, topicCount: 5, postCount: 20 }];
		vi.mocked(repo.findCategoriesWithStats).mockResolvedValue(mockCategories);

		const useCase = new GetCategoriesUseCase(repo);
		const result = await useCase.execute();

		expect(result).toEqual(mockCategories);
		expect(repo.findCategoriesWithStats).toHaveBeenCalled();
	});
});

describe('GetPostsUseCase', () => {
	it('should delegate to findPostsByTopicId', async () => {
		const repo = createMockForumRepository();
		vi.mocked(repo.findPostsByTopicId).mockResolvedValue([mockPost]);

		const useCase = new GetPostsUseCase(repo);
		const result = await useCase.execute('topic-1', { limit: 50, offset: 0 });

		expect(result).toEqual([mockPost]);
		expect(repo.findPostsByTopicId).toHaveBeenCalledWith('topic-1', { limit: 50, offset: 0 });
	});
});

describe('GetTopicsUseCase', () => {
	it('should delegate to findTopicsWithFilters', async () => {
		const repo = createMockForumRepository();
		vi.mocked(repo.findTopicsWithFilters).mockResolvedValue([mockTopic]);

		const useCase = new GetTopicsUseCase(repo);
		const result = await useCase.execute({ categoryId: 'cat-1' }, { limit: 50, offset: 0 });

		expect(result).toEqual([mockTopic]);
		expect(repo.findTopicsWithFilters).toHaveBeenCalledWith(
			{ categoryId: 'cat-1' },
			{ limit: 50, offset: 0 }
		);
	});
});

describe('GetCategoryBySlugUseCase', () => {
	it('should delegate to findCategoryBySlug', async () => {
		const repo = createMockForumRepository();
		vi.mocked(repo.findCategoryBySlug).mockResolvedValue(mockCategory);

		const useCase = new GetCategoryBySlugUseCase(repo);
		const result = await useCase.execute('general');

		expect(result).toEqual(mockCategory);
		expect(repo.findCategoryBySlug).toHaveBeenCalledWith('general');
	});
});

describe('IsTopicLockedUseCase', () => {
	it('should delegate to isTopicLocked', async () => {
		const repo = createMockForumRepository();
		vi.mocked(repo.isTopicLocked).mockResolvedValue(true);

		const useCase = new IsTopicLockedUseCase(repo);
		const result = await useCase.execute('topic-1');

		expect(result).toBe(true);
		expect(repo.isTopicLocked).toHaveBeenCalledWith('topic-1');
	});
});
