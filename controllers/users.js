const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET = 'dev-key' } = process.env;

function getUsers(request, response) {
  User.find({})
    .then((usersData) => response.send({ data: usersData }))
    .catch(() => response.status(500).send({ message: 'На сервере произошла ошибка' }));
}

function getUser(request, response) {
  User.findById(request.params.id)
    .then((userData) => {
      userData ? response.send({ data: userData }) : response.status(404).send({ message: 'Такого пользователя нет' });
    })
    .catch((error) => {
      let message = 'Ошибка сервера';
      let status = 500;
      if (error.name === 'CastError') {
        message = 'Введены некорректные данные';
        status = 400;
      }
      response.status(status).send({ message });
    });
}

function postUser(request, response) { // eslint-disable-line consistent-return
  const {
    email, password, name, about, avatar,
  } = request.body;
  if (!password.trim() || password.trim().length < 8) {
    return response.status(400).send({ message: 'Некорректный пароль' });
  }
  bcrypt.hash(password, 10)
    .then((passwordHash) => User.create({
      email, password: passwordHash, name, about, avatar,
    })
      .then((newUserData) => {
        newUserData.password = undefined; // eslint-disable-line no-param-reassign
        response.send({ data: newUserData });
      })
      .catch((error) => {
        let { message } = error;
        let status = 500;
        if (error.code === 11000) {
          message = 'Почта уже зрагестрирована';
          status = 409;
        } else if (error.name === 'ValidationError') {
          status = 400;
          message = 'Переданы некорректные данные';
        } else {
          status = 500;
          message = 'Ошибка сервера';
        }
        response.status(status).send({ message });
      }));
}

function updateProfileName(request, response) {
  User.findByIdAndUpdate(
    request.user._id,
    { name: request.body.name },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => {
      updatedData ? response.send({ data: updatedData }) : response.status(404).send({ message: 'Такого пользователя нет' });
    })
    .catch(() => response.status(500).send({ message: 'На сервере произошла ошибка или не пройдена валидация' }));
}

function updateAvatar(request, response) {
  User.findByIdAndUpdate(
    request.user._id,
    { avatar: request.body.avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((updatedData) => {
      updatedData ? response.send({ data: updatedData }) : response.status(404).send({ message: 'Такого пользователя нет' });
    })
    .catch(() => response.status(500).send({ message: 'На сервере произошла ошибка или не пройдена валидация' }));
}

function login(request, response) {
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
    .catch((error) => response.status(401).send({ message: error.message }));
}

module.exports = {
  getUsers,
  getUser,
  postUser,
  updateProfileName,
  updateAvatar,
  login,
};
