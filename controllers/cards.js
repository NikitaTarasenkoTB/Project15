const Card = require('../models/card');

function getCards(request, response) {
  Card.find({})
    .then((cardsData) => response.send({ data: cardsData }))
    .catch(() => response.status(500).send({ message: 'На сервере произошла ошибка' }));
}

function postCard(request, response) {
  const { name, link } = request.body;
  Card.create({ name, link, owner: request.user._id })
    .then((cardData) => response.send({ data: cardData }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        response.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        response.status(500).send({ message: 'Ошибка сервера' });
      }
    });
}

function deleteCard(request, response) {
  Card.findById(request.params.cardId)
    .then((cardData) => {
      if (cardData) {
        if (String(request.user._id) === String(cardData.owner)) {
          Card.findByIdAndRemove(request.params.cardId)
            .then((card) => response.send({ data: card }))
            .catch((error) => response.status(500).send({ message: error.message }));
        } else {
          response.status(403).send({ message: 'Нет прав' });
        }
      } else {
        response.status(404).send({ message: 'Карточка не найдена' });
      }
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

function addLike(request, response) {
  Card.findByIdAndUpdate(
    request.params.cardId,
    { $addToSet: { likes: request.user._id } },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newLikeData) => {
      newLikeData ? response.send({ message: newLikeData }) : response.status(404).send({ message: 'Карточка не найдена' });
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

function removeLike(request, response) {
  Card.findByIdAndUpdate(
    request.params.cardId,
    { $pull: { likes: request.user._id } },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newLikeData) => {
      newLikeData ? response.send({ message: newLikeData }) : response.status(404).send({ message: 'Карточка не найдена' });
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

module.exports = {
  getCards,
  postCard,
  deleteCard,
  addLike,
  removeLike,
};
