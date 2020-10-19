const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
require('dotenv').config();

const { PORT = 3000 } = process.env;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const auth = require('./middlewares/auth');

const { login, postUser } = require('./controllers/users');

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/signin', login);
app.post('/signup', postUser);

app.use('/', auth, cardsRouter);
app.use('/', auth, usersRouter);

app.use((request, response) => response.status(404).send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT);
