'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import ReactPlayer from 'react-player';

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  duration: number;
  posterUrl: string;
  videoUrl: string;
  rating: number;
  uploadedBy: {
    username: string;
  };
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}`);
      setMovie(response.data);
      setRating(response.data.rating);
      setLoading(false);
    } catch (error) {
      setError('Error fetching movie');
      setLoading(false);
    }
  };

  const handleRating = async (newRating: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to rate movies');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movies/${id}/rate`,
        { rating: newRating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRating(newRating);
    } catch (error) {
      setError('Error rating movie');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!movie) return <div className="p-8">Movie not found</div>;

  return (
    <div className="min-h-screen bg-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={movie.videoUrl}
                width="100%"
                height="100%"
                controls
                playing
              />
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-gray-400">{movie.releaseYear}</span>
                <span className="text-gray-400">{movie.duration} min</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`text-2xl ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-4">{movie.description}</p>
              <div className="flex flex-wrap gap-2">
                {movie.genre.map((genre) => (
                  <span
                    key={genre}
                    className="bg-secondary px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Movie Info</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400">Uploaded by</h3>
                  <p>{movie.uploadedBy.username}</p>
                </div>
                <div>
                  <h3 className="text-gray-400">Rating</h3>
                  <p>{rating}/5</p>
                </div>
                <div>
                  <h3 className="text-gray-400">Duration</h3>
                  <p>{movie.duration} minutes</p>
                </div>
                <div>
                  <h3 className="text-gray-400">Release Year</h3>
                  <p>{movie.releaseYear}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 