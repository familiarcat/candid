import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { entity, entityType } = req.body

  if (!entity || !entityType) {
    return res.status(400).json({ error: 'Entity and entityType are required' })
  }

  try {
    const prompt = generatePrompt(entity, entityType)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert talent acquisition and HR analytics assistant. Provide concise, professional insights about skills, positions, companies, and hiring authorities in the context of talent matching and recruitment. Keep responses to 2-3 sentences and focus on practical hiring insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const description = completion.choices[0]?.message?.content?.trim()

    return res.status(200).json({
      description: description || 'Unable to generate description.'
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Fallback descriptions if OpenAI fails
    const fallbackDescription = generateFallbackDescription(entity, entityType)
    
    return res.status(200).json({
      description: fallbackDescription
    })
  }
}

function generatePrompt(entity, entityType) {
  switch (entityType) {
    case 'skill':
      return `Analyze the skill "${entity.name}" in the context of hiring and talent acquisition. Consider its market demand (${entity.demand}), category (${entity.category}), and current industry trends. Provide insights on why this skill is valuable for hiring authorities and what types of roles typically require it.`
    
    case 'position':
      return `Analyze the position "${entity.title}" with level "${entity.level}" and type "${entity.type}". Consider the typical responsibilities, required skills (${entity.requirements?.join(', ') || 'various'}), and what hiring authorities should look for when filling this role.`
    
    case 'company':
      return `Analyze the company "${entity.name}" in the ${entity.industry} industry with ${entity.employeeCount} employees. Consider their likely hiring needs, organizational structure, and what makes them attractive to job seekers. Focus on their hiring authority structure and talent acquisition approach.`
    
    case 'authority':
      return `Analyze the hiring authority "${entity.name}" with role "${entity.role}" at level "${entity.level}" with ${entity.hiringPower} hiring power. Consider their decision-making influence, typical hiring responsibilities, and what job seekers should know when connecting with this authority level.`
    
    default:
      return `Provide a professional analysis of this ${entityType} in the context of talent acquisition and hiring.`
  }
}

function generateFallbackDescription(entity, entityType) {
  switch (entityType) {
    case 'skill':
      return `${entity.name} is a ${entity.demand?.toLowerCase() || 'medium'} demand skill in the ${entity.category || 'technology'} category. This skill is valuable for organizations looking to build technical capabilities and competitive advantage in their industry.`
    
    case 'position':
      return `${entity.title} is a ${entity.level || 'mid-level'} position that typically requires specialized skills and experience. This role is important for organizations looking to fill key operational or strategic functions.`
    
    case 'company':
      return `${entity.name} is a ${entity.size || 'growing'} company in the ${entity.industry || 'technology'} industry with ${entity.employeeCount || 'multiple'} employees. They likely have diverse hiring needs across various departments and skill levels.`
    
    case 'authority':
      return `${entity.name} serves as ${entity.role || 'a key decision maker'} with ${entity.hiringPower?.toLowerCase() || 'significant'} hiring authority. They play a crucial role in talent acquisition and organizational growth decisions.`
    
    default:
      return `This ${entityType} plays an important role in the talent acquisition and hiring process within the organization.`
  }
}
