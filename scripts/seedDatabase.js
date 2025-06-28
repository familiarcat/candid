import { initDb } from '../lib/db.js'
import { generateAllMatches } from '../lib/matchingAlgorithm.js'

// Comprehensive mock data for hiring authority matching demonstration
const mockData = {
  // 5 Companies with different sizes and hierarchies
  companies: [
    {
      _key: 'startup_techflow',
      name: 'TechFlow Innovations',
      industry: 'FinTech',
      size: 'Startup',
      employeeCount: 45,
      location: 'San Francisco, CA',
      description: 'Blockchain-based payment solutions startup',
      founded: '2022',
      website: 'https://techflow.com'
    },
    {
      _key: 'midsize_cloudtech',
      name: 'CloudTech Solutions',
      industry: 'Technology',
      size: 'Mid-size',
      employeeCount: 350,
      location: 'Austin, TX',
      description: 'Cloud infrastructure and DevOps services',
      founded: '2018',
      website: 'https://cloudtech.com'
    },
    {
      _key: 'enterprise_megacorp',
      name: 'MegaCorp Industries',
      industry: 'Manufacturing',
      size: 'Enterprise',
      employeeCount: 2500,
      location: 'Detroit, MI',
      description: 'Industrial automation and robotics',
      founded: '1995',
      website: 'https://megacorp.com'
    },
    {
      _key: 'midsize_designstudio',
      name: 'Design Studio Pro',
      industry: 'Design',
      size: 'Mid-size',
      employeeCount: 180,
      location: 'New York, NY',
      description: 'Digital design and user experience agency',
      founded: '2015',
      website: 'https://designstudio.com'
    },
    {
      _key: 'startup_aiventures',
      name: 'AI Ventures',
      industry: 'Artificial Intelligence',
      size: 'Startup',
      employeeCount: 28,
      location: 'Seattle, WA',
      description: 'Machine learning and AI consulting',
      founded: '2023',
      website: 'https://aiventures.com'
    }
  ],

  // Hiring Authorities based on company size logic
  hiringAuthorities: [
    // TechFlow (Startup) - C-Suite hiring
    {
      _key: 'ceo_techflow',
      name: 'Jennifer Martinez',
      role: 'CEO & Founder',
      level: 'C-Suite',
      companyId: 'companies/startup_techflow',
      email: 'jen@techflow.com',
      hiringPower: 'Ultimate',
      decisionMaker: true,
      skillsLookingFor: ['Leadership', 'FinTech', 'Blockchain', 'Full Stack', 'Startup Experience'],
      preferredExperience: '3-8 years',
      bio: 'Serial entrepreneur with 3 successful exits in FinTech'
    },
    {
      _key: 'cto_techflow',
      name: 'David Kim',
      role: 'CTO',
      level: 'C-Suite',
      companyId: 'companies/startup_techflow',
      email: 'david@techflow.com',
      hiringPower: 'Ultimate',
      decisionMaker: true,
      skillsLookingFor: ['React', 'Node.js', 'Blockchain', 'Solidity', 'AWS'],
      preferredExperience: '4-10 years',
      bio: 'Former Google engineer specializing in distributed systems'
    },

    // CloudTech (Mid-size) - VP/Director level
    {
      _key: 'vp_eng_cloudtech',
      name: 'Sarah Wilson',
      role: 'VP Engineering',
      level: 'Executive',
      companyId: 'companies/midsize_cloudtech',
      email: 'sarah@cloudtech.com',
      hiringPower: 'High',
      decisionMaker: true,
      skillsLookingFor: ['Kubernetes', 'Docker', 'Terraform', 'Python', 'Leadership'],
      preferredExperience: '5-12 years',
      bio: 'Infrastructure expert with 15 years in cloud technologies'
    },
    {
      _key: 'dir_product_cloudtech',
      name: 'Mike Chen',
      role: 'Director of Product',
      level: 'Director',
      companyId: 'companies/midsize_cloudtech',
      email: 'mike@cloudtech.com',
      hiringPower: 'High',
      decisionMaker: false,
      skillsLookingFor: ['Product Management', 'UX/UI', 'Analytics', 'Agile', 'Cloud Platforms'],
      preferredExperience: '4-8 years',
      bio: 'Product leader focused on developer experience'
    },

    // MegaCorp (Enterprise) - HR and Department Heads
    {
      _key: 'hr_director_megacorp',
      name: 'Lisa Thompson',
      role: 'HR Director',
      level: 'Director',
      companyId: 'companies/enterprise_megacorp',
      email: 'lisa@megacorp.com',
      hiringPower: 'Medium',
      decisionMaker: false,
      skillsLookingFor: ['Operations', 'Six Sigma', 'Project Management', 'Manufacturing'],
      preferredExperience: '3-10 years',
      bio: 'HR professional specializing in technical recruitment'
    },
    {
      _key: 'eng_manager_megacorp',
      name: 'Robert Davis',
      role: 'Engineering Manager',
      level: 'Manager',
      companyId: 'companies/enterprise_megacorp',
      email: 'robert@megacorp.com',
      hiringPower: 'Medium',
      decisionMaker: false,
      skillsLookingFor: ['C++', 'Embedded Systems', 'Robotics', 'PLC Programming'],
      preferredExperience: '5-15 years',
      bio: 'Robotics engineer with industrial automation expertise'
    },

    // Design Studio (Mid-size) - Creative leadership
    {
      _key: 'creative_director_design',
      name: 'Emma Rodriguez',
      role: 'Creative Director',
      level: 'Executive',
      companyId: 'companies/midsize_designstudio',
      email: 'emma@designstudio.com',
      hiringPower: 'High',
      decisionMaker: true,
      skillsLookingFor: ['Figma', 'User Research', 'Design Systems', 'Prototyping', 'Leadership'],
      preferredExperience: '4-10 years',
      bio: 'Award-winning designer with Fortune 500 client experience'
    },

    // AI Ventures (Startup) - Technical founders
    {
      _key: 'founder_ai',
      name: 'Dr. Alex Chen',
      role: 'Founder & Chief Scientist',
      level: 'C-Suite',
      companyId: 'companies/startup_aiventures',
      email: 'alex@aiventures.com',
      hiringPower: 'Ultimate',
      decisionMaker: true,
      skillsLookingFor: ['Machine Learning', 'Python', 'TensorFlow', 'Research', 'PhD'],
      preferredExperience: '3-12 years',
      bio: 'Former Stanford AI researcher with 50+ publications'
    }
  ],

  // Skills taxonomy
  skills: [
    { _key: 'react', name: 'React', category: 'Frontend', demand: 'High' },
    { _key: 'nodejs', name: 'Node.js', category: 'Backend', demand: 'High' },
    { _key: 'python', name: 'Python', category: 'Backend', demand: 'Very High' },
    { _key: 'typescript', name: 'TypeScript', category: 'Frontend', demand: 'High' },
    { _key: 'kubernetes', name: 'Kubernetes', category: 'DevOps', demand: 'High' },
    { _key: 'docker', name: 'Docker', category: 'DevOps', demand: 'High' },
    { _key: 'terraform', name: 'Terraform', category: 'Infrastructure', demand: 'Medium' },
    { _key: 'aws', name: 'AWS', category: 'Cloud', demand: 'Very High' },
    { _key: 'blockchain', name: 'Blockchain', category: 'Emerging', demand: 'Medium' },
    { _key: 'solidity', name: 'Solidity', category: 'Blockchain', demand: 'Low' },
    { _key: 'figma', name: 'Figma', category: 'Design', demand: 'High' },
    { _key: 'user_research', name: 'User Research', category: 'UX', demand: 'Medium' },
    { _key: 'machine_learning', name: 'Machine Learning', category: 'AI', demand: 'Very High' },
    { _key: 'tensorflow', name: 'TensorFlow', category: 'AI', demand: 'High' },
    { _key: 'cpp', name: 'C++', category: 'Systems', demand: 'Medium' },
    { _key: 'embedded', name: 'Embedded Systems', category: 'Hardware', demand: 'Medium' },
    { _key: 'robotics', name: 'Robotics', category: 'Engineering', demand: 'Low' },
    { _key: 'leadership', name: 'Leadership', category: 'Soft Skills', demand: 'High' },
    { _key: 'product_mgmt', name: 'Product Management', category: 'Business', demand: 'High' },
    { _key: 'agile', name: 'Agile', category: 'Methodology', demand: 'High' }
  ],

  // 20 Job Seekers with diverse backgrounds
  jobSeekers: [
    {
      _key: 'js_sarah_chen',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      currentTitle: 'Senior Frontend Developer',
      experience: 6,
      location: 'San Francisco, CA',
      skills: ['react', 'typescript', 'nodejs', 'aws'],
      skillLevels: { react: 9, typescript: 8, nodejs: 7, aws: 6 },
      desiredRole: 'Lead Frontend Engineer',
      salaryExpectation: 140000,
      remote: true,
      bio: 'Passionate frontend developer with startup experience'
    },
    {
      _key: 'js_marcus_johnson',
      name: 'Marcus Johnson',
      email: 'marcus.j@email.com',
      currentTitle: 'Full Stack Developer',
      experience: 4,
      location: 'Austin, TX',
      skills: ['python', 'react', 'aws', 'docker'],
      skillLevels: { python: 8, react: 7, aws: 6, docker: 7 },
      desiredRole: 'Senior Full Stack Developer',
      salaryExpectation: 120000,
      remote: false,
      bio: 'Full stack developer with cloud expertise'
    },
    {
      _key: 'js_emily_rodriguez',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      currentTitle: 'UX Designer',
      experience: 5,
      location: 'New York, NY',
      skills: ['figma', 'user_research', 'leadership'],
      skillLevels: { figma: 9, user_research: 8, leadership: 6 },
      desiredRole: 'Senior UX Designer',
      salaryExpectation: 110000,
      remote: true,
      bio: 'User-centered designer with Fortune 500 experience'
    },
    {
      _key: 'js_david_park',
      name: 'David Park',
      email: 'david.park@email.com',
      currentTitle: 'DevOps Engineer',
      experience: 7,
      location: 'Seattle, WA',
      skills: ['kubernetes', 'docker', 'terraform', 'aws', 'python'],
      skillLevels: { kubernetes: 9, docker: 9, terraform: 8, aws: 8, python: 7 },
      desiredRole: 'Senior DevOps Engineer',
      salaryExpectation: 135000,
      remote: true,
      bio: 'Infrastructure automation specialist'
    },
    {
      _key: 'js_lisa_wang',
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      currentTitle: 'Machine Learning Engineer',
      experience: 3,
      location: 'San Francisco, CA',
      skills: ['machine_learning', 'python', 'tensorflow'],
      skillLevels: { machine_learning: 8, python: 9, tensorflow: 7 },
      desiredRole: 'Senior ML Engineer',
      salaryExpectation: 150000,
      remote: true,
      bio: 'PhD in Computer Science, AI research background'
    },
    {
      _key: 'js_james_wilson',
      name: 'James Wilson',
      email: 'james.w@email.com',
      currentTitle: 'Blockchain Developer',
      experience: 2,
      location: 'Austin, TX',
      skills: ['blockchain', 'solidity', 'nodejs', 'react'],
      skillLevels: { blockchain: 7, solidity: 8, nodejs: 6, react: 5 },
      desiredRole: 'Senior Blockchain Developer',
      salaryExpectation: 130000,
      remote: true,
      bio: 'Early blockchain adopter with DeFi experience'
    },
    {
      _key: 'js_anna_kim',
      name: 'Anna Kim',
      email: 'anna.kim@email.com',
      currentTitle: 'Product Manager',
      experience: 5,
      location: 'New York, NY',
      skills: ['product_mgmt', 'agile', 'user_research', 'leadership'],
      skillLevels: { product_mgmt: 8, agile: 7, user_research: 6, leadership: 7 },
      desiredRole: 'Senior Product Manager',
      salaryExpectation: 125000,
      remote: false,
      bio: 'Product leader with B2B SaaS experience'
    },
    {
      _key: 'js_robert_davis',
      name: 'Robert Davis',
      email: 'robert.d@email.com',
      currentTitle: 'Embedded Systems Engineer',
      experience: 8,
      location: 'Detroit, MI',
      skills: ['cpp', 'embedded', 'robotics'],
      skillLevels: { cpp: 9, embedded: 8, robotics: 7 },
      desiredRole: 'Senior Embedded Engineer',
      salaryExpectation: 115000,
      remote: false,
      bio: 'Automotive industry veteran with robotics expertise'
    },
    {
      _key: 'js_maria_gonzalez',
      name: 'Maria Gonzalez',
      email: 'maria.g@email.com',
      currentTitle: 'Frontend Developer',
      experience: 3,
      location: 'Los Angeles, CA',
      skills: ['react', 'typescript', 'figma'],
      skillLevels: { react: 7, typescript: 6, figma: 5 },
      desiredRole: 'Senior Frontend Developer',
      salaryExpectation: 105000,
      remote: true,
      bio: 'Creative developer with design background'
    },
    {
      _key: 'js_kevin_lee',
      name: 'Kevin Lee',
      email: 'kevin.lee@email.com',
      currentTitle: 'Backend Developer',
      experience: 4,
      location: 'Chicago, IL',
      skills: ['python', 'nodejs', 'aws', 'docker'],
      skillLevels: { python: 8, nodejs: 7, aws: 6, docker: 6 },
      desiredRole: 'Senior Backend Developer',
      salaryExpectation: 115000,
      remote: true,
      bio: 'API design specialist with microservices experience'
    },
    // Additional 10 job seekers for comprehensive testing
    {
      _key: 'js_jennifer_brown',
      name: 'Jennifer Brown',
      email: 'jen.brown@email.com',
      currentTitle: 'Senior Product Designer',
      experience: 6,
      location: 'San Francisco, CA',
      skills: ['figma', 'user_research', 'leadership', 'product_mgmt'],
      skillLevels: { figma: 8, user_research: 9, leadership: 7, product_mgmt: 6 },
      desiredRole: 'Design Director',
      salaryExpectation: 145000,
      remote: true,
      bio: 'Design leader with startup and enterprise experience'
    },
    {
      _key: 'js_michael_zhang',
      name: 'Michael Zhang',
      email: 'michael.z@email.com',
      currentTitle: 'Cloud Architect',
      experience: 9,
      location: 'Austin, TX',
      skills: ['aws', 'kubernetes', 'terraform', 'python', 'leadership'],
      skillLevels: { aws: 9, kubernetes: 8, terraform: 9, python: 7, leadership: 8 },
      desiredRole: 'Principal Cloud Architect',
      salaryExpectation: 160000,
      remote: false,
      bio: 'Cloud infrastructure expert with enterprise scaling experience'
    },
    {
      _key: 'js_sophia_martinez',
      name: 'Sophia Martinez',
      email: 'sophia.m@email.com',
      currentTitle: 'AI Research Scientist',
      experience: 4,
      location: 'Seattle, WA',
      skills: ['machine_learning', 'python', 'tensorflow', 'leadership'],
      skillLevels: { machine_learning: 9, python: 9, tensorflow: 8, leadership: 5 },
      desiredRole: 'Senior AI Scientist',
      salaryExpectation: 170000,
      remote: true,
      bio: 'PhD in Machine Learning with published research'
    },
    {
      _key: 'js_alex_thompson',
      name: 'Alex Thompson',
      email: 'alex.t@email.com',
      currentTitle: 'Full Stack Engineer',
      experience: 5,
      location: 'New York, NY',
      skills: ['react', 'nodejs', 'python', 'aws', 'leadership'],
      skillLevels: { react: 8, nodejs: 8, python: 7, aws: 6, leadership: 6 },
      desiredRole: 'Engineering Manager',
      salaryExpectation: 140000,
      remote: false,
      bio: 'Technical leader transitioning to management'
    },
    {
      _key: 'js_rachel_kim',
      name: 'Rachel Kim',
      email: 'rachel.k@email.com',
      currentTitle: 'Robotics Engineer',
      experience: 6,
      location: 'Detroit, MI',
      skills: ['cpp', 'robotics', 'embedded', 'python'],
      skillLevels: { cpp: 8, robotics: 9, embedded: 7, python: 6 },
      desiredRole: 'Senior Robotics Engineer',
      salaryExpectation: 125000,
      remote: false,
      bio: 'Autonomous systems specialist with manufacturing background'
    },
    {
      _key: 'js_daniel_garcia',
      name: 'Daniel Garcia',
      email: 'daniel.g@email.com',
      currentTitle: 'Blockchain Architect',
      experience: 4,
      location: 'San Francisco, CA',
      skills: ['blockchain', 'solidity', 'nodejs', 'python', 'leadership'],
      skillLevels: { blockchain: 9, solidity: 9, nodejs: 7, python: 6, leadership: 5 },
      desiredRole: 'Lead Blockchain Developer',
      salaryExpectation: 155000,
      remote: true,
      bio: 'DeFi protocol architect with smart contract expertise'
    },
    {
      _key: 'js_amanda_wilson',
      name: 'Amanda Wilson',
      email: 'amanda.w@email.com',
      currentTitle: 'Senior UX Researcher',
      experience: 7,
      location: 'New York, NY',
      skills: ['user_research', 'figma', 'product_mgmt', 'leadership'],
      skillLevels: { user_research: 9, figma: 6, product_mgmt: 7, leadership: 8 },
      desiredRole: 'Head of UX Research',
      salaryExpectation: 135000,
      remote: true,
      bio: 'Research leader with quantitative and qualitative expertise'
    },
    {
      _key: 'js_carlos_rodriguez',
      name: 'Carlos Rodriguez',
      email: 'carlos.r@email.com',
      currentTitle: 'DevOps Manager',
      experience: 8,
      location: 'Austin, TX',
      skills: ['kubernetes', 'docker', 'terraform', 'aws', 'leadership'],
      skillLevels: { kubernetes: 9, docker: 8, terraform: 8, aws: 9, leadership: 8 },
      desiredRole: 'Director of Infrastructure',
      salaryExpectation: 150000,
      remote: false,
      bio: 'Infrastructure leader with team management experience'
    },
    {
      _key: 'js_natalie_chen',
      name: 'Natalie Chen',
      email: 'natalie.c@email.com',
      currentTitle: 'Frontend Architect',
      experience: 7,
      location: 'Los Angeles, CA',
      skills: ['react', 'typescript', 'nodejs', 'leadership'],
      skillLevels: { react: 9, typescript: 9, nodejs: 6, leadership: 7 },
      desiredRole: 'Principal Frontend Engineer',
      salaryExpectation: 145000,
      remote: true,
      bio: 'Frontend architecture specialist with performance optimization expertise'
    },
    {
      _key: 'js_thomas_lee',
      name: 'Thomas Lee',
      email: 'thomas.l@email.com',
      currentTitle: 'Data Scientist',
      experience: 5,
      location: 'Chicago, IL',
      skills: ['machine_learning', 'python', 'tensorflow', 'product_mgmt'],
      skillLevels: { machine_learning: 8, python: 9, tensorflow: 7, product_mgmt: 5 },
      desiredRole: 'Senior Data Scientist',
      salaryExpectation: 130000,
      remote: true,
      bio: 'Data scientist with business impact focus'
    }
  ],

  // Positions with authority relationships
  positions: [
    // TechFlow Innovations (Startup) - CTO hiring
    {
      _key: 'pos_senior_frontend_techflow',
      title: 'Senior Frontend Developer',
      companyId: 'companies/startup_techflow',
      authorityId: 'hiringAuthorities/cto_techflow',
      requirements: ['React', 'TypeScript', 'Node.js', 'Blockchain'],
      level: 'Senior',
      type: 'Full-time',
      location: 'San Francisco, CA',
      remote: true,
      salary: '$120,000 - $150,000',
      description: 'Lead frontend development for our blockchain payment platform',
      benefits: ['Equity', 'Health Insurance', 'Remote Work'],
      status: 'active',
      postedDate: '2024-01-15',
      applicants: 12
    },
    {
      _key: 'pos_blockchain_dev_techflow',
      title: 'Blockchain Developer',
      companyId: 'companies/startup_techflow',
      authorityId: 'hiringAuthorities/ceo_techflow',
      requirements: ['Blockchain', 'Solidity', 'Node.js', 'FinTech'],
      level: 'Mid-level',
      type: 'Full-time',
      location: 'San Francisco, CA',
      remote: true,
      salary: '$110,000 - $140,000',
      description: 'Build smart contracts and DeFi protocols',
      benefits: ['Equity', 'Health Insurance', 'Learning Budget'],
      status: 'active',
      postedDate: '2024-01-20',
      applicants: 8
    },

    // CloudTech Solutions (Mid-size) - VP Engineering hiring
    {
      _key: 'pos_devops_engineer_cloudtech',
      title: 'Senior DevOps Engineer',
      companyId: 'companies/midsize_cloudtech',
      authorityId: 'hiringAuthorities/vp_eng_cloudtech',
      requirements: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'Python'],
      level: 'Senior',
      type: 'Full-time',
      location: 'Austin, TX',
      remote: false,
      salary: '$130,000 - $160,000',
      description: 'Scale our cloud infrastructure and DevOps practices',
      benefits: ['401k Match', 'Health Insurance', 'PTO'],
      status: 'active',
      postedDate: '2024-01-10',
      applicants: 15
    },
    {
      _key: 'pos_product_manager_cloudtech',
      title: 'Senior Product Manager',
      companyId: 'companies/midsize_cloudtech',
      authorityId: 'hiringAuthorities/dir_product_cloudtech',
      requirements: ['Product Management', 'Agile', 'Cloud Platforms', 'Analytics'],
      level: 'Senior',
      type: 'Full-time',
      location: 'Austin, TX',
      remote: true,
      salary: '$115,000 - $145,000',
      description: 'Drive product strategy for our cloud platform',
      benefits: ['Stock Options', 'Health Insurance', 'Remote Work'],
      status: 'active',
      postedDate: '2024-01-12',
      applicants: 22
    },

    // MegaCorp Industries (Enterprise) - HR and Engineering Manager hiring
    {
      _key: 'pos_embedded_engineer_megacorp',
      title: 'Embedded Systems Engineer',
      companyId: 'companies/enterprise_megacorp',
      authorityId: 'hiringAuthorities/eng_manager_megacorp',
      requirements: ['C++', 'Embedded Systems', 'Robotics', 'PLC Programming'],
      level: 'Mid-level',
      type: 'Full-time',
      location: 'Detroit, MI',
      remote: false,
      salary: '$95,000 - $120,000',
      description: 'Develop embedded systems for industrial automation',
      benefits: ['Pension', 'Health Insurance', 'Training Programs'],
      status: 'active',
      postedDate: '2024-01-08',
      applicants: 18
    },
    {
      _key: 'pos_operations_manager_megacorp',
      title: 'Operations Manager',
      companyId: 'companies/enterprise_megacorp',
      authorityId: 'hiringAuthorities/hr_director_megacorp',
      requirements: ['Operations', 'Six Sigma', 'Project Management', 'Manufacturing'],
      level: 'Manager',
      type: 'Full-time',
      location: 'Detroit, MI',
      remote: false,
      salary: '$85,000 - $110,000',
      description: 'Manage manufacturing operations and process improvement',
      benefits: ['Pension', 'Health Insurance', 'Career Development'],
      status: 'active',
      postedDate: '2024-01-05',
      applicants: 25
    },

    // Design Studio Pro (Mid-size) - Creative Director hiring
    {
      _key: 'pos_senior_ux_designer_design',
      title: 'Senior UX Designer',
      companyId: 'companies/midsize_designstudio',
      authorityId: 'hiringAuthorities/creative_director_design',
      requirements: ['Figma', 'User Research', 'Design Systems', 'Prototyping'],
      level: 'Senior',
      type: 'Full-time',
      location: 'New York, NY',
      remote: true,
      salary: '$105,000 - $135,000',
      description: 'Lead UX design for Fortune 500 client projects',
      benefits: ['Creative Time', 'Health Insurance', 'Conference Budget'],
      status: 'active',
      postedDate: '2024-01-18',
      applicants: 31
    },
    {
      _key: 'pos_product_designer_design',
      title: 'Product Designer',
      companyId: 'companies/midsize_designstudio',
      authorityId: 'hiringAuthorities/creative_director_design',
      requirements: ['Figma', 'User Research', 'Product Management', 'Leadership'],
      level: 'Mid-level',
      type: 'Full-time',
      location: 'New York, NY',
      remote: true,
      salary: '$90,000 - $115,000',
      description: 'Design digital products from concept to launch',
      benefits: ['Creative Time', 'Health Insurance', 'Flexible Hours'],
      status: 'active',
      postedDate: '2024-01-22',
      applicants: 19
    },

    // AI Ventures (Startup) - Founder hiring
    {
      _key: 'pos_ml_engineer_ai',
      title: 'Senior Machine Learning Engineer',
      companyId: 'companies/startup_aiventures',
      authorityId: 'hiringAuthorities/founder_ai',
      requirements: ['Machine Learning', 'Python', 'TensorFlow', 'Research'],
      level: 'Senior',
      type: 'Full-time',
      location: 'Seattle, WA',
      remote: true,
      salary: '$140,000 - $170,000',
      description: 'Research and develop cutting-edge AI solutions',
      benefits: ['Equity', 'Health Insurance', 'Research Budget'],
      status: 'active',
      postedDate: '2024-01-25',
      applicants: 14
    },
    {
      _key: 'pos_ai_researcher_ai',
      title: 'AI Research Scientist',
      companyId: 'companies/startup_aiventures',
      authorityId: 'hiringAuthorities/founder_ai',
      requirements: ['Machine Learning', 'Python', 'TensorFlow', 'PhD', 'Research'],
      level: 'Senior',
      type: 'Full-time',
      location: 'Seattle, WA',
      remote: true,
      salary: '$150,000 - $180,000',
      description: 'Lead AI research initiatives and publish findings',
      benefits: ['Equity', 'Health Insurance', 'Publication Support'],
      status: 'active',
      postedDate: '2024-01-28',
      applicants: 7
    }
  ]
}

// Function to wipe and seed database
export async function seedDatabase() {
  try {
    console.log('🗄️ Connecting to database...')
    const { db, collections } = await initDb()

    console.log('🧹 Clearing existing data...')
    // Clear all collections
    const collectionNames = Object.keys(collections)
    for (const collectionName of collectionNames) {
      try {
        await collections[collectionName].truncate()
        console.log(`   ✅ Cleared ${collectionName}`)
      } catch (error) {
        console.log(`   ⚠️ Collection ${collectionName} doesn't exist, creating...`)
        await collections[collectionName].create()
      }
    }

    console.log('🏢 Seeding companies...')
    for (const company of mockData.companies) {
      await collections.companies.save(company)
    }

    console.log('👔 Seeding hiring authorities...')
    for (const authority of mockData.hiringAuthorities) {
      await collections.hiringAuthorities.save(authority)
    }

    console.log('🛠️ Seeding skills...')
    for (const skill of mockData.skills) {
      await collections.skills.save(skill)
    }

    console.log('👥 Seeding job seekers...')
    for (const jobSeeker of mockData.jobSeekers) {
      await collections.jobSeekers.save(jobSeeker)
    }

    console.log('📋 Seeding positions...')
    for (const position of mockData.positions) {
      const savedPosition = await collections.positions.save(position)

      // Create skill requirement relationships
      for (const skillName of position.requirements) {
        // Find skill by name
        const skillQuery = `
          FOR skill IN skills
            FILTER LOWER(skill.name) == LOWER(@skillName)
            RETURN skill
        `
        const skillCursor = await db.query(skillQuery, { skillName })
        const skills = await skillCursor.all()

        if (skills.length > 0) {
          // Create requirement relationship
          await collections.requires.save({
            _from: savedPosition._id,
            _to: skills[0]._id,
            createdAt: new Date().toISOString()
          })
        }
      }

      // Create authority posting relationship
      await collections.posts.save({
        _from: position.authorityId,
        _to: savedPosition._id,
        createdAt: new Date().toISOString()
      })
    }

    console.log('🎯 Generating authority matches...')
    const matches = await generateAllMatches(
      mockData.jobSeekers,
      mockData.hiringAuthorities,
      mockData.companies
    )

    console.log(`   Generated ${matches.length} potential matches`)
    for (const match of matches) {
      await collections.matches.save(match)
    }

    console.log('✅ Database seeded successfully!')
    console.log(`   📊 ${mockData.companies.length} companies`)
    console.log(`   👔 ${mockData.hiringAuthorities.length} hiring authorities`)
    console.log(`   👥 ${mockData.jobSeekers.length} job seekers`)
    console.log(`   🛠️ ${mockData.skills.length} skills`)
    console.log(`   📋 ${mockData.positions.length} positions`)
    console.log(`   🎯 ${matches.length} authority matches`)

    return {
      success: true,
      message: 'Database seeded successfully with positions and authority matches',
      stats: {
        companies: mockData.companies.length,
        hiringAuthorities: mockData.hiringAuthorities.length,
        jobSeekers: mockData.jobSeekers.length,
        skills: mockData.skills.length,
        positions: mockData.positions.length,
        matches: matches.length
      }
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(result => {
      console.log('Seeding complete:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
