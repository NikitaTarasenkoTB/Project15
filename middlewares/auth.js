const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../errors/errors');

module.exports = (request, response, next) => { // eslint-disable-line consistent-return
  const { JWT_SECRET = 'dev-key' } = process.env;

  const token = request.cookies.jwt;
  let userId;

  if (!token) {
    next(new UnauthorizedError('Необходимо авторизоваться'));
    return;
  }

  try {
    userId = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedError('Необходимо авторизоваться'));
    return;
  }

  request.user = userId;
  next();
};
