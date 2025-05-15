'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  duration: number;
  posterUrl: string;
  videoUrl: string;
  featured: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value);
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

      fetchMovies();
    } catch (error) {
      setError('Error uploading movie');
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <form onSubmit={handleSubmit} className="mb-12 bg-secondary p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Upload New Movie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Genre (comma-separated)</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-primary border border-gray-600"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block mb-2">Poster</label>
            <input
              type="file"
              name="poster"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Video</label>
            <input
              type="file"
              name="video"
              onChange={handleFileChange}
              accept="video/*"
              className="w-full p-2 rounded bg-primary border border-gray-600"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              Featured Movie
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 bg-accent text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Upload Movie
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Manage Movies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-secondary p-4 rounded-lg">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {movie.genre.join(', ')} • {movie.releaseYear}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Duration: {movie.duration} minutes
              </p>
              <button
                onClick={() => handleDelete(movie._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
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