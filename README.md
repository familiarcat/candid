# Candid Connections Katra

A graph-based talent matching platform that visualizes connections between job seekers, companies, positions, and skills.

## Features

- Interactive 2D and 3D network visualizations
- Job seeker and company profiles
- Position matching based on skills and requirements
- Dashboard with key metrics and recent activity
- Graph database integration with ArangoDB

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Visualization**: D3.js, 3D-Force-Graph
- **Database**: ArangoDB (graph database)
- **API**: Next.js API routes

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/components` - React components
- `/pages` - Next.js pages and API routes
- `/lib` - Utility functions and helpers
- `/public` - Static assets
- `/styles` - Global styles

## Database Schema

The graph database consists of the following collections:

- **Nodes**:
  - `jobSeekers` - Individual job seekers
  - `companies` - Companies with open positions
  - `positions` - Job positions
  - `skills` - Skills required for positions or possessed by job seekers

- **Edges**:
  - `works_for` - Job seeker works for company
  - `posts` - Company posts position
  - `requires` - Position requires skill
  - `has_skill` - Job seeker has skill
  - `matched_to` - Job seeker matched to position

## License

MIT