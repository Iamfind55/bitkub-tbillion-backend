export class BaseError extends Error {
    constructor(public message: string, public statusCode: number = 500, public context?: any) {
        super(message);
    }
}

export class NotFoundError extends BaseError {
    constructor() {
        super('Resource not found', 404);
    }
}

export class PermissionDeniedError extends BaseError {
    constructor() {
        super('Permission denied', 404);
    }
}

export class BadRequestError extends BaseError {
    constructor() {
        super('Bad request', 400);
    }
}
export class AlreadyExistError extends BaseError {
    constructor() {
        super('Already exists', 400);
    }
}

export class ValidateError extends BaseError {
    constructor() {
        super('Validate failed', 404);
    }
}

export class ExpiredError extends BaseError {
    constructor() {
        super('Resource expired', 404);
    }
}

export class UnauthorizedError extends BaseError {
    constructor() {
        super('Unauthorized', 401);
    }
}

export class ValidationError extends BaseError {
    constructor(public errors: string[]) {
        super('Validation failed');
    }
}

export class ConflictError extends BaseError {
    constructor(public errors: string[]) {
        super('Unused', 409);
    }
}

export class ServerError extends BaseError {
    constructor() {
        super('Server error', 500);
    }
}