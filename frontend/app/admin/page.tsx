'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import './admin.css';

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  duration: string;
  posterUrl: string;
  videoUrl: string;
  featured: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    releaseYear: '',
    duration: '',
    featured: false,
    poster: null as File | null,
    video: null as File | null,
  });

  useEffect(() => {
    fetchMovies();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const fetchMovies = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/movies`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMovies(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching movies');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      // Handle each field with proper type checking
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (value instanceof File) {
            formDataToSend.append(key, value);
          } else if (typeof value === 'boolean') {
            formDataToSend.append(key, value.toString());
          } else {
            formDataToSend.append(key, value as string);
          }
        }
      });

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/movies`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          },
        }
      );

      setFormData({
        title: '',
        description: '',
        genre: '',
        releaseYear: '',
        duration: '',
        featured: false,
        poster: null,
        video: null,
      });
      setUploadProgress(0);
      fetchMovies();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error uploading movie');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchMovies();
    } catch (error) {
      setError('Error deleting movie');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
  <div className="admin-container">
    <h1 className="admin-title">Admin Dashboard</h1>
    <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
    

    <form onSubmit={handleSubmit} className="admin-form">
      <h2 className="form-title">Upload New Movie</h2>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Genre (comma-separated)</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Release Year</label>
          <input
            type="number"
            name="releaseYear"
            value={formData.releaseYear}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group md-col-span-2">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Poster</label>
          <input
            type="file"
            name="poster"
            onChange={handleFileChange}
            accept="image/*"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Video</label>
          <input
            type="file"
            name="video"
            onChange={handleFileChange}
            accept="video/*"
            className="form-input"
            required
          />
        </div>

        <div className="form-group md-col-span-2">
          <label className="form-label flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="form-checkbox"
            />
            Featured Movie
          </label>
        </div>
      </div>

      <button type="submit" className="form-submit">
        Upload Movie
      </button>
    </form>

    <div>
      <h2 className="manage-title">Manage Movies</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie._id} className="movie-card">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="movie-poster"
            />
            <h3 className="movie-name">{movie.title}</h3>
            <p className="movie-meta">
              {movie.genre.join(', ')} • {movie.releaseYear}
            </p>
            <p className="movie-meta">
              Duration: {movie.duration} minutes
            </p>
            <button
              onClick={() => handleDelete(movie._id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
} 