# Candid Connections Katra

A graph-based talent matching platform that connects job seekers directly to the **correct hiring authority** based on company hierarchy, decision-making power, and skill alignment.

## 🎯 Core Philosophy

**Skip the job board grind.** Our platform uses graph database technology to map organizational hierarchies and identify the right hiring authority for each job seeker based on:

- **Company Size Logic**: Startup (<100) → Executives, Mid-size (100-1000) → Department Heads, Enterprise (1000+) → HR Hierarchy
- **Hiring Authority Hierarchy**: CEO/CTO/VP → Directors → Managers → HR Specialists
- **Skill Connection Edges**: Graph edges represent skill matches, experience overlap, and requirement alignment
- **Decision-Making Power**: Direct routing to authorities with actual hiring power

## 🌟 Key Features

### 🏢 Hiring Authority Mapping
- Maps company organizational structures to identify correct hiring authorities
- Analyzes decision-making power and hiring influence
- Routes job seekers to authorities with actual hiring power

### 🔗 Graph Database Connections
- Multi-dimensional skill matching through graph edges
- Weighted connections based on experience overlap
- Real-time relationship mapping between all entities

### ⚖️ Company Size Intelligence
- Startup routing: Direct to C-Suite (CEO, CTO, Founder)
- Mid-size routing: Department heads and VPs
- Enterprise routing: Specialized HR hierarchy and directors

### 🎯 Authority-Centric Matching
- Job seeker → Hiring Authority → Position pipeline
- Skill alignment scoring with hiring authority requirements
- Experience level matching with authority hiring criteria

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

## 🗄️ Graph Database Schema

The graph database is designed around **hiring authority connections** with the following collections:

### **Core Nodes**:
- **`jobSeekers`** - Candidates seeking the right hiring authority
- **`hiringAuthorities`** - Decision makers across company hierarchies (CEO, CTO, VP, Directors, HR)
- **`companies`** - Organizations with size-based hierarchy mapping
- **`positions`** - Roles mapped to specific hiring authorities
- **`skills`** - Competencies that create connection edges

### **Relationship Edges**:
- **`works_for`** - Hiring Authority → Company (with hierarchy level)
- **`posts`** - Hiring Authority → Position (decision-making power)
- **`requires`** - Position → Skills (weighted requirements)
- **`has_skill`** - Job Seeker → Skills (proficiency levels)
- **`matched_to`** - Job Seeker → Hiring Authority (connection strength)
- **`reports_to`** - Hiring Authority → Hiring Authority (organizational hierarchy)

### **Company Size Logic Implementation**:
```javascript
// Startup (<100 employees)
hiringAuthority.level = "C-Suite" // CEO, CTO, Founder
hiringAuthority.hiringPower = "Ultimate"

// Mid-size (100-1000 employees)
hiringAuthority.level = "Executive" // VP, Director
hiringAuthority.hiringPower = "High"

// Enterprise (1000+ employees)
hiringAuthority.level = "Manager" // HR Director, Department Head
hiringAuthority.hiringPower = "Medium"
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/familiarcat/candid.git
   cd candid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start ArangoDB with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Seed the database**
   - Visit `http://localhost:3000/admin`
   - Click "🌱 Seed Database" to populate with mock data

### 🗄️ Database Setup

The application uses ArangoDB running in Docker. The database will be automatically created and seeded with:
- 5 Companies with different organizational structures
- 8 Hiring Authorities across hierarchy levels
- 20 Job Seekers with diverse skill sets
- 20 Skills with market demand tracking
- 147+ Generated authority matches

## 📊 Live Demo

Visit the following pages to explore the platform:
- **`/`** - Homepage with hiring authority philosophy
- **`/hiring-authorities`** - Browse decision makers by company hierarchy
- **`/job-seekers`** - View candidates seeking the right authority
- **`/matches`** - Explore authority-to-candidate connections
- **`/companies`** - Company profiles with size-based routing logic
- **`/admin`** - Database management and seeding tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [ArangoDB](https://arangodb.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by the philosophy of connecting job seekers directly to hiring authorities