# 🤖 OpenAI Integration Setup Guide

## Overview
Our Candid Connections application now includes **OpenAI-powered salary data generation** that provides realistic, market-accurate salary information for skills based on current industry trends.

## Features
- **Real-time salary data** generated using GPT-4
- **Market insights** including demand trends and growth projections
- **Location-based adjustments** for geographic salary variations
- **Experience level breakdowns** (Junior, Mid, Senior)
- **Intelligent caching** to minimize API costs
- **Graceful fallbacks** when OpenAI is unavailable

## Setup Instructions

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Environment Configuration
Add your OpenAI API key to your `.env.local` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Install Dependencies
The OpenAI package should already be installed. If not:

```bash
npm install openai
```

### 4. Usage

#### In the Skills Page
1. Navigate to `/skills`
2. Click the **"🤖 AI Enhance Salaries"** button
3. Wait for the enhancement process to complete
4. Skills will now show AI-generated salary data with enhanced accuracy

#### API Endpoints

**Single Skill Lookup:**
```
GET /api/salary-data?skillName=React&category=Frontend&experienceLevel=Senior
```

**Batch Processing:**
```
POST /api/salary-data
{
  "skills": [
    { "name": "React", "category": "Frontend" },
    { "name": "Node.js", "category": "Backend" }
  ],
  "options": {
    "location": "San Francisco",
    "experienceLevel": "Mid"
  }
}
```

## Cost Management

### Rate Limiting
- Automatic delays between API calls
- Batch processing to minimize requests
- Intelligent caching (24-hour cache)

### Fallback System
If OpenAI is unavailable or API key is missing:
- Falls back to static salary calculations
- Application continues to function normally
- No user-facing errors

### Expected Costs
- **GPT-4 usage**: ~$0.03 per skill enhancement
- **Typical enhancement**: 20 skills = ~$0.60
- **Caching**: Reduces repeat costs significantly

## Sample Response Format

```json
{
  "success": true,
  "data": {
    "averageSalary": "$125,000",
    "salaryRange": {
      "min": "$110,000",
      "max": "$140,000"
    },
    "experienceLevels": {
      "junior": "$85,000 - $105,000",
      "mid": "$110,000 - $130,000",
      "senior": "$135,000 - $160,000"
    },
    "marketInsights": {
      "demandTrend": "High",
      "growthProjection": "+12% annually",
      "keyFactors": [
        "Remote work adoption",
        "Digital transformation",
        "Component-based architecture demand"
      ]
    },
    "locationAdjustment": {
      "nationalAverage": "$125,000",
      "locationMultiplier": 1.3,
      "topPayingCities": ["San Francisco", "New York", "Seattle"]
    },
    "metadata": {
      "generatedAt": "2024-01-15T10:30:00Z",
      "source": "OpenAI GPT-4",
      "skillName": "React",
      "category": "Frontend"
    }
  }
}
```

## Benefits

### For Users
- **Accurate salary expectations** based on current market data
- **Location-specific insights** for better career planning
- **Growth trend analysis** for skill investment decisions
- **Experience level guidance** for career progression

### For Platform
- **Enhanced data quality** beyond static calculations
- **Competitive advantage** with AI-powered insights
- **User engagement** through valuable, actionable data
- **Scalable enhancement** for any skill category

## Troubleshooting

### Common Issues

**API Key Not Working:**
- Verify key is correctly set in `.env.local`
- Ensure key starts with `sk-`
- Check OpenAI account has sufficient credits

**Slow Response Times:**
- Normal for first-time generation
- Subsequent requests use cached data
- Consider reducing batch sizes

**Fallback Mode:**
- Check console for error messages
- Verify internet connectivity
- Confirm OpenAI service status

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

## Future Enhancements

### Planned Features
- **Industry-specific adjustments** (Startup vs Enterprise)
- **Benefits package analysis** beyond base salary
- **Regional cost-of-living integration**
- **Historical trend analysis**
- **Skill combination premium calculations**

### Integration Opportunities
- **Job posting salary suggestions**
- **Candidate expectation matching**
- **Market trend dashboards**
- **Compensation planning tools**

---

## 🎯 Ready to Use!

Your OpenAI integration is now ready to provide **world-class salary insights** that will make Candid Connections the most valuable platform for talent matching and career planning.

**Test it out:** Visit `/skills` and click "🤖 AI Enhance Salaries" to see the magic happen!
