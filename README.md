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

## License

MIT