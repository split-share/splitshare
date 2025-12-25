/**
 * Domain error types for typed error handling
 */

export enum ErrorCode {
	// Validation errors
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	INVALID_INPUT = 'INVALID_INPUT',

	// Resource errors
	NOT_FOUND = 'NOT_FOUND',
	ALREADY_EXISTS = 'ALREADY_EXISTS',

	// Authorization errors
	UNAUTHORIZED = 'UNAUTHORIZED',
	FORBIDDEN = 'FORBIDDEN',

	// Business logic errors
	BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION'
}

export abstract class DomainError extends Error {
	abstract readonly code: ErrorCode;

	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class ValidationError extends DomainError {
	readonly code = ErrorCode.VALIDATION_ERROR;
}

export class NotFoundError extends DomainError {
	readonly code = ErrorCode.NOT_FOUND;

	constructor(resource: string, id?: string) {
		super(id ? `${resource} with id '${id}' not found` : `${resource} not found`);
	}
}

export class AlreadyExistsError extends DomainError {
	readonly code = ErrorCode.ALREADY_EXISTS;

	constructor(resource: string, field?: string) {
		super(field ? `${resource} with this ${field} already exists` : `${resource} already exists`);
	}
}

export class UnauthorizedError extends DomainError {
	readonly code = ErrorCode.UNAUTHORIZED;

	constructor(message = 'Authentication required') {
		super(message);
	}
}

export class ForbiddenError extends DomainError {
	readonly code = ErrorCode.FORBIDDEN;

	constructor(action: string, resource: string) {
		super(`Not authorized to ${action} this ${resource}`);
	}
}

export class BusinessRuleError extends DomainError {
	readonly code = ErrorCode.BUSINESS_RULE_VIOLATION;
}
