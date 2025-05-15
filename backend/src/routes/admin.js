const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload a new movie
router.post('/movies', adminAuth, upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, genre, releaseYear, duration, featured } = req.body;
    
    // Upload poster to Cloudinary
    const posterResult = await cloudinary.uploader.upload(req.files.poster[0].buffer.toString('base64'), {
      folder: 'movie-posters',
      resource_type: 'image'
    });

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(req.files.video[0].buffer.toString('base64'), {
      folder: 'movie-videos',
      resource_type: 'video'
    });

    const movie = new Movie({
      title,
      description,
      genre: genre.split(','),
      releaseYear,
      duration,
      posterUrl: posterResult.secure_url,
      videoUrl: videoResult.secure_url,
      featured: featured === 'true',
      uploadedBy: req.user._id,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading movie' });
  }
});

// Update a movie
router.put('/movies/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, genre, releaseYear, duration, featured } = req.body;
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.genre = genre ? genre.split(',') : movie.genre;
    movie.releaseYear = releaseYear || movie.releaseYear;
    movie.duration = duration || movie.duration;
    movie.featured = featured === 'true' || movie.featured;

    await movie.save();
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error updating movie' });
  }
});

// Delete a movie
router.delete('/movies/:id', adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Delete from Cloudinary
    const posterPublicId = movie.posterUrl.split('/').pop().split('.')[0];
    const videoPublicId = movie.videoUrl.split('/').pop().split('.')[0];
    
    await cloudinary.uploader.destroy(posterPublicId);
    await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });

    await movie.remove();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting movie' });
  }
});

// Get all movies (admin view)
router.get('/movies', adminAuth, async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies' });
  }
});

module.exports = router; 