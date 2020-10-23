const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const linkRegExp = require('../regexp');

const {
  getUsers, getUser, updateProfileName, updateAvatar,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), getUser);
usersRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfileName);
usersRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(linkRegExp),
  }),
}), updateAvatar);

module.exports = usersRouter;
