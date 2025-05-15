import Link from 'next/link'
import { FaPlay } from 'react-icons/fa'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">MovieFlix</h1>
        <nav className="space-x-4">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <Link href="/movies" className="hover:text-accent transition-colors">
            Movies
          </Link>
          <Link href="/login" className="hover:text-accent transition-colors">
            Login
          </Link>
        </nav>
      </header>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-6">Featured Movies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Movie cards will be dynamically rendered here */}
          {[1, 2, 3, 4].map((movie) => (
            <div
              key={movie}
              className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform"
            >
              <div className="relative aspect-video bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="text-4xl text-accent" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Movie Title</h3>
                <p className="text-gray-400 text-sm">
                  Action, Adventure • 2024
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-4xl font-bold mb-6">Latest Releases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Latest movies will be dynamically rendered here */}
          {[1, 2, 3, 4].map((movie) => (
            <div
              key={movie}
              className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform"
            >
              <div className="relative aspect-video bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="text-4xl text-accent" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Latest Movie</h3>
                <p className="text-gray-400 text-sm">
                  Drama, Thriller • 2024
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
} 