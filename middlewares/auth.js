const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => { // eslint-disable-line consistent-return
  const { JWT_SECRET = 'dev-key' } = process.env;

  const token = request.cookies.jwt;
  let userId;

  if (!token) {
    return response.status(401).send({ message: 'Необходимо авторизоваться' });
  }

  try {
    userId = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return response.status(401).send({ message: 'Необходимо авторизоваться' });
  }

  request.user = userId;
  next();
};
