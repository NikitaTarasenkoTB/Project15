const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  NotFoundError, BadRrequestError, ConflictError, UnauthorizedError,
} = require('../errors/errors');

const { JWT_SECRET = 'dev-key' } = process.env;

function getUsers(request, response, next) {
  User.find({})
    .then((usersData) => response.send({ data: usersData }))
    .catch(next);
}

function getUser(request, response, next) {
  User.findById(request.params.id)
    .then((userData) => {
      if (userData) {
        response.send({ data: userData });
      } else {
        throw new NotFoundError();
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRrequestError());
        return;
      }
      next(error);
    });
}

function postUser(request, response, next) { // eslint-disable-line consistent-return
  const {
    email, password, name, about, avatar,
  } = request.body;
  bcrypt.hash(password, 10)
    .then((passwordHash) => User.create({
      email, password: passwordHash, name, about, avatar,
    })
      .then((newUserData) => {
        newUserData.password = undefined; // eslint-disable-line no-param-reassign
        response.send({ data: newUserData });
      })
      .catch((error) => {
        if (error.name === 'MongoError' && error.code === 11000) {
          next(new ConflictError('Почта уже зарегестрирована'));
          return;
        } if (error.name === 'ValidationError') {
          next(new BadRrequestError());
          return;
        }
        next(error);
      }));
}

function updateProfileName(request, response, next) {
  User.findByIdAndUpdate(
    request.user._id,
    {
      name: request.body.name,
      about: request.body.about,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => {
      if (updatedData) {
        response.send({ data: updatedData });
      } else {
        throw new NotFoundError();
      }
    })
    .catch(next);
}

function updateAvatar(request, response, next) {
  User.findByIdAndUpdate(
    request.user._id,
    { avatar: request.body.avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => {
      if (updatedData) {
        response.send({ data: updatedData });
      } else {
        throw new NotFoundError();
      }
    })
    .catch(next);
}

function login(request, response, next) {
  const { email, password } = request.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' },
      );
      response.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true, sameSite: true });
      response.status(200).send({ message: 'Добро пожаловать!' });
    })
    .catch((error) => next(new UnauthorizedError(error.message)));
}

module.exports = {
  getUsers,
  getUser,
  postUser,
  updateProfileName,
  updateAvatar,
  login,
};
