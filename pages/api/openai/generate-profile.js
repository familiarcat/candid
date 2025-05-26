// OpenAI Profile Generation API - Creates AI-enhanced profiles for all entity types
// Provides comprehensive, contextual descriptions for companies, authorities, job seekers, skills, and positions

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { entity, entityType, context = 'profile_generation' } = req.body

    if (!entity || !entityType) {
      return res.status(400).json({ error: 'Entity and entityType are required' })
    }

    // Generate contextual prompt based on entity type
    const prompt = generatePrompt(entity, entityType, context)

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert talent acquisition and business analysis AI. Create professional, insightful profiles that help users understand the value and potential of entities in a professional network. Be concise but comprehensive, focusing on practical insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const profile = completion.choices[0]?.message?.content?.trim()

    if (!profile) {
      throw new Error('No profile generated')
    }

    res.status(200).json({ 
      profile,
      entityType,
      context,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenAI Profile Generation Error:', error)
    
    // Return fallback profile on error
    const fallbackProfile = generateFallbackProfile(req.body.entity, req.body.entityType)
    
    res.status(200).json({ 
      profile: fallbackProfile,
      entityType: req.body.entityType,
      context: req.body.context,
      fallback: true,
      error: error.message
    })
  }
}

function generatePrompt(entity, entityType, context) {
  const baseInfo = {
    name: entity.name || entity.title || 'Unknown',
    ...entity
  }

  switch (entityType) {
    case 'company':
      return `Create a professional company profile for ${baseInfo.name}.

Company Details:
- Industry: ${entity.industry || 'Technology'}
- Size: ${entity.employeeCount || 100} employees
- Open Positions: ${entity.openPositions || 0}
- Hiring Authorities: ${entity.hiringAuthorities?.length || 0}
- Description: ${entity.description || 'Not provided'}

Focus on:
1. Company culture and values
2. Growth potential and market position
3. What makes them attractive to job seekers
4. Their hiring philosophy and team dynamics
5. Career development opportunities

Write a compelling 2-3 paragraph profile that would help job seekers understand why they'd want to work there.`

    case 'authority':
      return `Create a professional profile for hiring authority ${baseInfo.name}.

Authority Details:
- Role: ${entity.role || 'Hiring Manager'}
- Level: ${entity.level || 'Manager'}
- Company: ${entity.company || 'Not specified'}
- Hiring Power: ${entity.hiringPower || 'Medium'}
- Decision Maker: ${entity.decisionMaker ? 'Yes' : 'No'}
- Experience: ${entity.experience || 'Not specified'}

Focus on:
1. Their leadership style and approach to hiring
2. What they look for in candidates
3. Their role in company growth and team building
4. How they support employee development
5. Their industry expertise and background

Write a professional 2-3 paragraph profile that helps job seekers understand their hiring approach and what it's like to work with them.`

    case 'jobSeeker':
      return `Create a professional profile for job seeker ${baseInfo.name}.

Job Seeker Details:
- Experience Level: ${entity.experienceLevel || 'Mid-level'}
- Location: ${entity.location || 'Remote'}
- Skills: ${entity.skills?.join(', ') || 'Various technical skills'}
- Preferred Role: ${entity.preferredRole || 'Not specified'}
- Industry Interest: ${entity.industryInterest || 'Technology'}
- Education: ${entity.education || 'Not specified'}

Focus on:
1. Their professional strengths and unique value proposition
2. Career goals and aspirations
3. Key skills and expertise areas
4. What type of work environment they thrive in
5. Their potential contribution to teams and organizations

Write an engaging 2-3 paragraph profile that showcases their professional potential and what makes them a valuable candidate.`

    case 'skill':
      return `Create an informative profile for the skill "${baseInfo.name}".

Skill Details:
- Category: ${entity.category || 'Technology'}
- Demand Level: ${entity.demand || 'High'}
- Job Seekers with this skill: ${entity.jobSeekerCount || 0}
- Open positions requiring this skill: ${entity.positionCount || 0}
- Related Skills: ${entity.relatedSkills?.join(', ') || 'Various'}

Focus on:
1. The importance and relevance of this skill in today's market
2. Career opportunities it opens up
3. How it complements other skills
4. Industry trends and future demand
5. Learning and development pathways

Write an informative 2-3 paragraph profile that explains the value and potential of this skill for career development.`

    case 'position':
      return `Create a comprehensive profile for the position "${baseInfo.title || baseInfo.name}".

Position Details:
- Level: ${entity.level || 'Mid-level'}
- Department: ${entity.department || 'Engineering'}
- Company: ${entity.company || 'Not specified'}
- Required Skills: ${entity.requiredSkills?.join(', ') || 'Various'}
- Salary Range: ${entity.salaryRange || 'Competitive'}
- Location: ${entity.location || 'Not specified'}

Focus on:
1. The role's responsibilities and impact
2. Growth opportunities and career progression
3. Required skills and qualifications
4. What makes this position attractive
5. The type of candidate who would excel

Write a compelling 2-3 paragraph profile that helps both job seekers and hiring authorities understand the value and requirements of this position.`

    default:
      return `Create a professional profile for ${baseInfo.name} (${entityType}). 

Available Information:
${JSON.stringify(entity, null, 2)}

Focus on providing valuable insights about this entity's role, value, and potential in a professional network context.`
  }
}

function generateFallbackProfile(entity, entityType) {
  const name = entity?.name || entity?.title || 'Unknown'
  
  switch (entityType) {
    case 'company':
      return `${name} is a ${entity?.industry || 'technology'} company with approximately ${entity?.employeeCount || 100} employees. As a growing organization, they focus on innovation and building strong teams. The company offers opportunities for professional development and values collaboration. They are actively hiring for ${entity?.openPositions || 0} positions and maintain a dynamic work environment that encourages growth and creativity.`

    case 'authority':
      return `${name} serves as a ${entity?.role || 'hiring manager'} with ${entity?.hiringPower || 'medium'} hiring authority. They are responsible for identifying and recruiting top talent while building cohesive teams. With their experience in talent acquisition, they understand the importance of cultural fit and technical expertise. They work closely with candidates to ensure mutual success and are committed to fostering professional growth within their organization.`

    case 'jobSeeker':
      return `${name} is a ${entity?.experienceLevel || 'mid-level'} professional with expertise in ${entity?.skills?.slice(0, 3).join(', ') || 'various technical areas'}. They bring a combination of technical skills and professional experience to potential roles. Known for their adaptability and continuous learning mindset, they are seeking opportunities that align with their career goals and values. Their background demonstrates a commitment to excellence and collaborative problem-solving.`

    case 'skill':
      return `${name} is a valuable skill in the ${entity?.category || 'technology'} domain with ${entity?.demand || 'high'} market demand. This skill is essential for modern organizations and opens up numerous career opportunities. Currently, ${entity?.jobSeekerCount || 0} professionals in our network possess this skill, while ${entity?.positionCount || 0} positions require it. Developing expertise in this area can significantly enhance career prospects and professional value.`

    case 'position':
      return `${name} is a ${entity?.level || 'mid-level'} position in the ${entity?.department || 'engineering'} department. This role requires expertise in ${entity?.requiredSkills?.slice(0, 3).join(', ') || 'various technical skills'} and offers opportunities for professional growth. The position involves meaningful work that contributes to organizational success and provides a platform for career advancement. Ideal candidates will bring both technical competence and collaborative skills to the role.`

    default:
      return `${name} is an important entity in our professional network. This ${entityType} plays a valuable role in connecting talent with opportunities and contributes to the overall ecosystem of professional relationships. Understanding their position and potential helps in making informed decisions about career development and business relationships.`
  }
}
