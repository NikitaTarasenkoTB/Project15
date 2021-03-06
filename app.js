const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors, celebrate, Joi } = require('celebrate');

const app = express();
require('dotenv').config();

const { PORT = 3000 } = process.env;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const { requestLogger, errorLogger } = require('./middlewares/logger');

const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const auth = require('./middlewares/auth');

const { login, postUser } = require('./controllers/users');
const { ServerError, NotFoundError } = require('./errors/errors');
const linkRegExp = require('./regexp');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().trim().required().min(8),
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().regex(linkRegExp),
  }),
}), postUser);

app.use('/', auth, cardsRouter);
app.use('/', auth, usersRouter);

app.use((request, response, next) => next(new NotFoundError('Запрашиваемый ресурс не найден')));

app.use(errorLogger);

app.use(errors());

app.use((myError, request, response, next) => { // eslint-disable-line no-unused-vars
  if (!myError.status) { myError = new ServerError(); } // eslint-disable-line no-param-reassign
  response.status(myError.status).send({ message: myError.message });
});

app.listen(PORT);
console.log(`Listening port: ${PORT}`);
