# Movie Website

A full-stack movie website built with Next.js, Express, MongoDB Atlas, and Tailwind CSS.

## Features

- Responsive movie browsing interface
- Admin panel for movie management
- User authentication
- Movie upload and streaming
- MongoDB Atlas database integration

## Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Express.js
- Database: MongoDB Atlas
- Authentication: JWT

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   ```
4. Create a `.env.local` file in the frontend directory with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
5. Start the development servers:
   ```bash
   npm run dev
   ```

## Project Structure

- `/frontend` - Next.js frontend application
- `/backend` - Express.js backend server
- `/frontend/app` - Next.js app directory
- `/frontend/components` - Reusable React components
- `/backend/routes` - API routes
- `/backend/models` - MongoDB models
- `/backend/controllers` - Route controllers
- `/backend/middleware` - Custom middleware 