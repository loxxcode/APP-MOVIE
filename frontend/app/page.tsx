import Link from 'next/link'
import { FaPlay } from 'react-icons/fa'
import './page.css'

export default function Home() {
  return (
    <main className="main-container">
      <header className="header">
        <h1 className="header-title">MovieFlix</h1>
        <nav className="nav">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/movies" className="nav-link">Movies</Link>
          <Link href="/login" className="nav-link">Login</Link>
        </nav>
      </header>

      <section className="section">
        <h2 className="section-title">Featured Movies</h2>
        <div className="movie-grid">
          {[1, 2, 3, 4].map((movie) => (
            <div key={movie} className="movie-card">
              <div className="movie-poster">
                <div className="movie-poster-content">
                  <FaPlay className="icon" />
                </div>
              </div>
              <div className="movie-info">
                <h3 className="movie-title">Movie Title</h3>
                <p className="movie-meta">Action, Adventure • 2024</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Latest Releases</h2>
        <div className="movie-grid">
          {[1, 2, 3, 4].map((movie) => (
            <div key={movie} className="movie-card">
              <div className="movie-poster">
                <div className="movie-poster-content">
                  <FaPlay className="icon" />
                </div>
              </div>
              <div className="movie-info">
                <h3 className="movie-title">Latest Movie</h3>
                <p className="movie-meta">Drama, Thriller • 2024</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}