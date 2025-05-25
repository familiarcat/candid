# Database Management Guide

## 🗄️ **Database Cleanup & Consistency**

This guide covers the database management workflow for maintaining consistent, clean data during development.

## 🧹 **Database Cleanup Process**

### **Problem Solved**
- **Multiple Duplicates**: Previous seeding created duplicate records
- **Sample Data Fallbacks**: Pages used inconsistent fallback data when APIs failed
- **Testing Inconsistency**: Different developers had different data sets
- **Build Process Issues**: Sample data mixed with real database data

### **Solution Implemented**
1. **Complete Database Reset**: Clear all collections entirely before seeding
2. **Removed Sample Data**: Eliminated all fallback sample data from pages
3. **Automated Scripts**: Created tools for consistent data management
4. **Single Source of Truth**: All data comes from database only

## 🛠️ **Development Scripts**

### **Available Commands**

```bash
# Clear database and reseed with fresh data
npm run ensure-dev-data

# Clear data + start development server
npm run dev:clean

# Standard development (uses existing data)
npm run dev

# Production build and start
npm run build
npm start
```

### **Script Details**

#### `npm run ensure-dev-data`
- Clears database entirely
- Runs seeding scripts
- Verifies data integrity
- Reports data counts
- **Use when**: Starting fresh development, fixing data issues

#### `npm run dev:clean`
- Runs `ensure-dev-data` first
- Then starts development server
- **Use when**: Want guaranteed clean data for testing

## 📊 **Current Data Structure**

### **Seeded Data Counts**
- **5 Companies**: TechCorp, DataFlow, GreenTech, CloudTech, InnovateTech
- **8 Hiring Authorities**: C-Suite, VPs, Directors across companies
- **20 Job Seekers**: Diverse skill sets and experience levels
- **20 Skills**: Frontend, Backend, DevOps, Design, Data Science
- **10 Positions**: Various roles across all companies
- **148 Matches**: Algorithm-generated job seeker to authority matches

### **Data Relationships**
- Companies ↔ Hiring Authorities (employs)
- Companies ↔ Positions (posts)
- Job Seekers ↔ Skills (has_skill)
- Positions ↔ Skills (requires)
- Job Seekers ↔ Hiring Authorities (matched_to)
- Hiring Authorities ↔ Hiring Authorities (reports_to)

## 🔧 **Removed Sample Data**

### **Files Cleaned**
- `pages/companies.js`: Removed 70+ lines of sample companies
- `pages/hiring-authorities.js`: Removed 90+ lines of sample authorities
- `pages/skills.js`: Removed 115+ lines of sample skills
- `pages/matches.js`: Removed 150+ lines of sample matches
- `pages/positions.js`: Removed 85+ lines of sample positions

### **Behavior Change**
**Before**: Pages showed sample data when API failed
**After**: Pages show empty state with warning to seed database

## 🎯 **Data Integrity Verification**

The `ensure-dev-data` script verifies:
- All API endpoints return data
- No endpoints return empty results
- Database connections are working
- Seeding completed successfully

### **Verification Output**
```
✓ /api/companies: 5 records
✓ /api/hiring-authorities: 8 records  
✓ /api/job-seekers: 20 records
✓ /api/skills: 20 records
✓ /api/positions: 10 records
✓ /api/matches: 148 records
```

## 🚀 **Development Workflow**

### **Starting Development**
1. **Fresh Start**: `npm run dev:clean`
2. **Continue Work**: `npm run dev`
3. **Fix Data Issues**: `npm run ensure-dev-data`

### **Testing Features**
- All developers now have identical data sets
- Consistent entity relationships for testing
- Real database calculations for supply/demand
- No sample data interference

### **Production Deployment**
- Build process uses only real database data
- No sample data fallbacks in production
- Consistent data structure across environments

## ⚠️ **Important Notes**

### **Database Connection Required**
- All pages now require database connection
- No offline/fallback mode available
- Ensure ArangoDB is running before starting

### **Data Consistency**
- Always use `ensure-dev-data` when data seems inconsistent
- Don't manually edit database records during development
- Use seeding scripts to maintain proper relationships

### **Performance**
- Database clearing and seeding takes ~5-10 seconds
- Only run when necessary, not on every development start
- Use `npm run dev` for normal development

## 🔍 **Troubleshooting**

### **Empty Pages**
**Problem**: Pages show no data
**Solution**: Run `npm run ensure-dev-data`

### **Inconsistent Data**
**Problem**: Different counts or missing relationships
**Solution**: Run `npm run ensure-dev-data` to reset

### **API Errors**
**Problem**: Database connection issues
**Solution**: Check ArangoDB is running, verify connection settings

### **Build Failures**
**Problem**: Build process fails due to data issues
**Solution**: Ensure database is seeded before building
