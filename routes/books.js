var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

function asyncWrapper(cb) {
  return async(req,res,next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

/* GET books listing. */
router.get('/', asyncWrapper(async (req, res, next) => {
  let books = await Book.findAll();
  res.render('books/index', {title: "Books", books});
}));

router.get('/new', function(req, res, next) {
  res.render('books/new', {book: {}, title:"New Book"});
});

router.post('/new', asyncWrapper(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render('books/new', {book, errors:error.errors, title:"New Book"});
    } else {
      throw error;
    }
  }
}));

router.get('/:id', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  res.render('books/update', {book, title:"Update Book"});
}));

router.post('/:id', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  await book.update(req.body);
  res.redirect('/');
}));

router.get('/:id/delete', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  res.render('books/delete', {book, title:"Delete Book"})
}));

router.post('/:id/delete', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  await book.destroy();
  res.redirect('/');
}));

module.exports = router;
