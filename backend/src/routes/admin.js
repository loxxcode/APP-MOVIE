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

// Log Cloudinary configuration status
console.log('Cloudinary Config Status:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024 * 1024, // 3GB limit
  }
});

// Upload a new movie
router.post('/movies', adminAuth, upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    // Log request details
    console.log('Request received:', {
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files'
    });

    const { title, description, genre, releaseYear, duration, featured } = req.body;
    
    // Validate required fields
    if (!title || !description || !genre || !releaseYear || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'description', 'genre', 'releaseYear', 'duration']
      });
    }

    // Validate files
    if (!req.files || !req.files.poster || !req.files.video) {
      return res.status(400).json({ 
        message: 'Poster and video files are required',
        received: req.files ? Object.keys(req.files) : 'No files'
      });
    }

    // Upload poster to Cloudinary
    console.log('Starting poster upload...');
    let posterUrl;
    try {
      const posterBuffer = req.files.poster[0].buffer;
      const posterBase64 = posterBuffer.toString('base64');
      const posterDataURI = `data:${req.files.poster[0].mimetype};base64,${posterBase64}`;
      
      const posterResult = await cloudinary.uploader.upload(posterDataURI, {
        folder: 'movie-posters',
        resource_type: 'image',
        chunk_size: 6000000 // 6MB chunks for large files
      });
      posterUrl = posterResult.secure_url;
      console.log('Poster uploaded successfully:', posterUrl);
    } catch (posterError) {
      console.error('Poster upload error:', posterError);
      return res.status(500).json({ 
        message: 'Error uploading poster',
        error: posterError.message
      });
    }

    // Upload video to Cloudinary
    console.log('Starting video upload...');
    let videoUrl;
    try {
      const videoBuffer = req.files.video[0].buffer;
      const videoBase64 = videoBuffer.toString('base64');
      const videoDataURI = `data:${req.files.video[0].mimetype};base64,${videoBase64}`;
      
      const videoResult = await cloudinary.uploader.upload(videoDataURI, {
        folder: 'movie-videos',
        resource_type: 'video',
        chunk_size: 6000000, // 6MB chunks for large files
        eager: [
          { format: 'mp4', quality: 'auto' }
        ]
      });
      videoUrl = videoResult.secure_url;
      console.log('Video uploaded successfully:', videoUrl);
    } catch (videoError) {
      console.error('Video upload error:', videoError);
      return res.status(500).json({ 
        message: 'Error uploading video',
        error: videoError.message
      });
    }

    // Create movie document
    console.log('Creating movie document...');
    const movie = new Movie({
      title,
      description,
      genre: genre.split(',').map(g => g.trim()),
      releaseYear: parseInt(releaseYear),
      duration,
      posterUrl,
      videoUrl,
      featured: featured === 'true',
      uploadedBy: req.user._id,
    });

    // Save movie
    console.log('Saving movie to database...');
    await movie.save();
    console.log('Movie saved successfully');
    
    res.status(201).json({
      message: 'Movie uploaded successfully',
      movie
    });
  } catch (error) {
    console.error('Error in movie upload:', error);
    res.status(500).json({ 
      message: 'Error uploading movie',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all movies (admin view)
router.get('/movies', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all movies...');
    const movies = await Movie.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    console.log(`Found ${movies.length} movies`);
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ 
      message: 'Error fetching movies',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
    movie.genre = genre ? genre.split(',').map(g => g.trim()) : movie.genre;
    movie.releaseYear = releaseYear ? parseInt(releaseYear) : movie.releaseYear;
    movie.duration = duration || movie.duration;
    movie.featured = featured === 'true' || movie.featured;

    await movie.save();
    res.json(movie);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ 
      message: 'Error updating movie',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    await movie.deleteOne();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ 
      message: 'Error deleting movie',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 