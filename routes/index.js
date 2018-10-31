var express = require('express');
var router = express.Router();
var movieCTRL = require('../modules/movieController');

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.json(await movieCTRL.getAllMovies())
});

router.post('/', async function (req, res, next) {
  res.json(await movieCTRL.addMovie(req.body, req.files.poster));
});

router.put('/:id', async function (req, res, next) {
  res.json(await movieCTRL.updateRating(req.params.id, req.body.rating));
});

module.exports = router;