// handler errors
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class DBError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// other
export class NotDefinedError extends Error {
  constructor(message: string) {
    super(message);
  }
}
