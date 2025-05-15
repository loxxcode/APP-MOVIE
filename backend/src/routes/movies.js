const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { auth } = require('../middleware/auth');

// Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

// Get featured movies
router.get('/featured', async (req, res) => {
  try {
    const movies = await Movie.find({ featured: true })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured movies' });
  }
});

// Get movie by ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('uploadedBy', 'username');
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie' });
  }
});

// Search movies
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const movies = await Movie.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error searching movies' });
  }
});

// Rate a movie
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    movie.rating = rating;
    await movie.save();
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error rating movie' });
  }
});

module.exports = router; 