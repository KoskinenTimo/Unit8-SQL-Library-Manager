var express = require('express');
const { Op } = require("sequelize");
var router = express.Router();
const Book = require('../models').Book;

/**
 * Wraps routes where used with try-catch.
 * 
 * @param {Function} callback 
 * @returns try-catch wrapping
 */
function asyncWrapper(callback) {
  return async(req,res,next) => {
    try {
      await callback(req, res, next);
    } catch (err) {
      next(err);
    }
  }
}

/**
 * Searches for query string from all attributes of the library book database.
 * 
 * @param {String} query 
 * @returns Array of books
 */
async function searchBooks(query) {
  try {
    let books = await Book.findAll({
      where: {
        [Op.or]: 
        [
        {title: {[Op.like]: `%${query}%`}},
        {author: {[Op.like]: `%${query}%`}},
        {genre: {[Op.like]: `%${query}%`}},
        {year: {[Op.like]: `%${query}%`}},
        ]
      }
    })
    return books.map(book => book.toJSON());
  } catch (error) {
    throw error;
  }
}

/**
 * Gives number of pages for pagination.
 * 
 * @param {Array} books 
 * @returns {Integer}
 */
function numberOfPages(books) {
  return Math.ceil(books.length/8);
}

/**
 * Takes the page number of pagination and returns the correct list of books
 * in the section of the page.
 * @param {Integer} page 
 * @returns {Array}
 */
async function showBooks(page) {
  const skip = 0 + 8 * (page - 1);
  let books = await Book.findAll({offset:skip,limit:8});  
  books = books.map(book => book.toJSON());
  return books;
}

// Route for /books and redirects to first page view of book list.
router.get('/', function (req,res,next) {
  res.redirect('/books/page/1');
});

// Route to show each page of books according to pagination.
router.get('/page/:page', asyncWrapper(async (req, res, next) => {
  let books = await Book.findAll();
  const pages = await numberOfPages(books);
  const booksPage = await showBooks(req.params.page);
  res.render('books/index', {title: "My Books", books:booksPage, pages:pages});
}));

// Route to handle search, loads the list of results without pagination.
router.post('/', asyncWrapper(async (req, res, next) => {
  let books = await searchBooks(req.body.searchInput);
  res.render('books/index', {title: "My Books", books});
}));

// Route to create a new book
router.get('/new', function(req, res, next) {
  res.render('books/new-book', {book: {}, title:"New Book"});
});

// Route to handle new book submit
router.post('/new', asyncWrapper(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/page/1');
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);      
      res.render('books/new-book', {book, errors:error.errors, title:"New Book"});
    } else {
      throw error;
    }
  }
}));

// Route to view each book according to book id.
router.get('/:id', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  if (book) {
    res.render('books/show', {book, title:"Book Details"});
  } else {
    res.sendStatus(404);
  }
}));

// Route to edit book, book edited has the same id in :id field as in database.
router.get('/:id/edit', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  if (book) {
    res.render('books/update-book', {book, title:"Book Details"});
  } else {
    res.sendStatus(404);
  }
}));

// Route to handle book update submit.
router.post('/:id/edit', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book
  try {
    book = await Book.findByPk(id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books');
    } else {
      res.sendStatus(404);
    }    
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = id;
      res.render('books/update-book', {book, errors:error.errors, title:"Update Book"});
    } else {
      throw error;
    }
  }
}));

// Route to confirmation page to confirm the removal of the chosen book.
router.get('/:id/delete', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  res.render('books/delete', {book, title:"Delete Book"})
}));

// Route to handle the deleting a book after confirmation.
router.post('/:id/delete', asyncWrapper(async (req, res, next) => {
  let id = req.params.id;
  let book = await Book.findByPk(id);
  await book.destroy();
  res.redirect('/');
}));

module.exports = router;
