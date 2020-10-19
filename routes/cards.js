const cardsRouter = require('express').Router();
const {
  getCards, postCard, deleteCard, addLike, removeLike,
} = require('../controllers/cards');

cardsRouter.get('/cards', getCards);
cardsRouter.post('/cards', postCard);
cardsRouter.delete('/cards/:cardId', deleteCard);
cardsRouter.put('/cards/:cardId/likes', addLike);
cardsRouter.delete('/cards/:cardId/likes', removeLike);

module.exports = cardsRouter;
