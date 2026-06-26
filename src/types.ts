export type WorkMode = 'On-site' | 'Hybrid' | 'Remote'

export type Seniority =
  | 'Trainee'
  | 'Junior'
  | 'Officer'
  | 'Manager'
  | 'Senior'
  | 'Director'
  | 'Executive'

export type ContractType =
  | 'Permanent'
  | 'Fixed term'
  | 'Internship'
  | 'Consultancy'
  | 'Freelance'
  | 'Secondment'

export type OrganisationType =
  | 'EU institution'
  | 'Agency'
  | 'NGO'
  | 'Think tank'
  | 'Trade association'
  | 'Public affairs'
  | 'Law firm'
  | 'Media'
  | 'Corporate'
  | 'International organisation'

export interface Job {
  id: string
  title: string
  organisationId: string
  organisation: string
  logo: string
  city: string
  country: string
  workMode: WorkMode
  policyAreas: string[]
  category: string
  seniority: Seniority
  contractType: ContractType
  languages: string[]
  salaryMin?: number
  salaryMax?: number
  salaryEstimate?: string
  postedAt: string
  deadline: string
  verified: boolean
  paidInternship?: boolean
  featured?: boolean
  urgent?: boolean
  transparentSalary?: boolean
  visaNote: string
  applyType: 'External ATS' | 'Email' | 'Hosted apply'
  summary: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  matchReasons: string[]
  source: string
}

export interface JobFilters {
  query: string
  city: string
  policy: string
  category: string
  seniority: string
  contract: string
  workMode: string
  language: string
  deadline: string
  pay: string
  sort: string
}

export interface Organisation {
  id: string
  name: string
  type: OrganisationType
  logo: string
  city: string
  country: string
  policyAreas: string[]
  openRoles: number
  verified: boolean
  salaryTransparency: number
  hiringVelocity: 'Low' | 'Medium' | 'High'
  followers: string
  website: string
  description: string
  badges: string[]
}

export interface PricingPlan {
  name: string
  price: string
  description: string
  highlight?: boolean
  features: string[]
  addOns: string[]
}

export interface Guide {
  title: string
  tag: string
  readTime: string
  description: string
}

export interface InternshipCycle {
  name: string
  organiser: string
  window: string
  start: string
  paid: boolean
  notes: string
}

export interface SalaryBand {
  role: string
  city: string
  seniority: Seniority
  low: number
  median: number
  high: number
  sample: number
}

export interface AdminQueueItem {
  id: string
  label: string
  type: 'Job review' | 'Employer profile' | 'Salary estimate' | 'Report'
  risk: 'Low' | 'Medium' | 'High'
  status: string
}
