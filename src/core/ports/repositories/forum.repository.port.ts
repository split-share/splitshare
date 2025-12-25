import type {
	ForumCategory,
	ForumCategoryWithStats,
	ForumTopicWithDetails,
	ForumPostWithAuthor,
	CreateTopicDto,
	UpdateTopicDto,
	CreatePostDto,
	UpdatePostDto,
	TopicFiltersDto,
	PaginationDto
} from '$core/domain/forum/forum.dto';

export interface IForumRepository {
	// Categories
	findAllCategories(): Promise<ForumCategory[]>;
	findCategoryBySlug(slug: string): Promise<ForumCategory | undefined>;
	findCategoriesWithStats(): Promise<ForumCategoryWithStats[]>;

	// Topics
	findTopicById(id: string): Promise<ForumTopicWithDetails | undefined>;
	findTopicsWithFilters(
		filters: TopicFiltersDto,
		pagination: PaginationDto
	): Promise<ForumTopicWithDetails[]>;
	createTopic(input: CreateTopicDto): Promise<ForumTopicWithDetails>;
	updateTopic(id: string, input: UpdateTopicDto): Promise<ForumTopicWithDetails>;
	deleteTopic(id: string): Promise<void>;
	incrementViewCount(id: string): Promise<void>;
	topicExists(id: string): Promise<boolean>;
	isTopicOwnedByUser(id: string, userId: string): Promise<boolean>;
	isTopicLocked(id: string): Promise<boolean>;

	// Posts
	findPostsByTopicId(topicId: string, pagination: PaginationDto): Promise<ForumPostWithAuthor[]>;
	createPost(input: CreatePostDto): Promise<ForumPostWithAuthor>;
	updatePost(id: string, input: UpdatePostDto): Promise<ForumPostWithAuthor>;
	deletePost(id: string): Promise<void>;
	postExists(id: string): Promise<boolean>;
	isPostOwnedByUser(id: string, userId: string): Promise<boolean>;
}
