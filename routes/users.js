const usersRouter = require('express').Router();

const {
  getUsers, getUser, updateProfileName, updateAvatar,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/:id', getUser);
usersRouter.patch('/users/me', updateProfileName);
usersRouter.patch('/users/me/avatar', updateAvatar);

module.exports = usersRouter;
