class MyError extends Error { // eslint-disable-line max-classes-per-file
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ServerError extends MyError {
  constructor(message = 'Ошибка сервера') {
    super(message, 500);
  }
}

class NotFoundError extends MyError {
  constructor(message = 'Данные не найдены') {
    super(message, 404);
  }
}

class BadRrequestError extends MyError {
  constructor(message = 'Введены некорректные данные') {
    super(message, 400);
  }
}

class ConflictError extends MyError {
  constructor(message = 'Ошибка валидации') {
    super(message, 409);
  }
}

class ForbiddenError extends MyError {
  constructor(message = 'Нет прав на совершение действия') {
    super(message, 403);
  }
}

class UnauthorizedError extends MyError {
  constructor(message = 'Неправильные почта или пароль') {
    super(message, 401);
  }
}

module.exports = {
  MyError,
  ServerError,
  NotFoundError,
  BadRrequestError,
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
};
