const Card = require('../models/card');
const { BadRrequestError, NotFoundError, ForbiddenError } = require('../errors/errors');

function getCards(request, response, next) {
  Card.find({})
    .then((cardsData) => response.send({ data: cardsData }))
    .catch(next);
}

function postCard(request, response, next) {
  const { name, link } = request.body;
  Card.create({ name, link, owner: request.user._id })
    .then((cardData) => response.send({ data: cardData }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRrequestError();
      }
      next(error);
    });
}

function deleteCard(request, response, next) {
  Card.findById(request.params.cardId)
    .then((cardData) => {
      if (cardData) {
        if (String(request.user._id) === String(cardData.owner)) {
          Card.findByIdAndRemove(request.params.cardId)
            .then((card) => response.send({ data: card }))
            .catch(next);
        } else {
          throw new ForbiddenError();
        }
      } else {
        throw new NotFoundError();
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRrequestError());
      }
      next(error);
    });
}

function addLike(request, response, next) {
  Card.findByIdAndUpdate(
    request.params.cardId,
    { $addToSet: { likes: request.user._id } },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newLikeData) => {
      if (newLikeData) {
        response.send({ message: newLikeData });
      } else {
        throw new NotFoundError();
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRrequestError());
      }
      next(error);
    });
}

function removeLike(request, response, next) {
  Card.findByIdAndUpdate(
    request.params.cardId,
    { $pull: { likes: request.user._id } },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newLikeData) => {
      if (newLikeData) {
        response.send({ message: newLikeData });
      } else {
        throw new NotFoundError();
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRrequestError());
      }
      next(error);
    });
}

module.exports = {
  getCards,
  postCard,
  deleteCard,
  addLike,
  removeLike,
};
