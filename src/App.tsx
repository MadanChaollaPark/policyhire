import { useMemo, useState } from 'react'
import {
  BarChart3,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Euro,
  ExternalLink,
  Eye,
  Factory,
  FileText,
  Filter,
  Globe2,
  Heart,
  LineChart,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import euCareersBanner from './assets/eu-careers-banner.png'
import {
  adminQueue,
  categories,
  cities,
  contractTypes,
  featureChecklist,
  guides,
  internshipCycles,
  jobs,
  languages,
  organisationTypes,
  organisations,
  policyAreas,
  pricingPlans,
  recruiterMetrics,
  salaryBands,
  seniorities,
  workModes,
} from './data'
import type { Job } from './types'
import './App.css'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

const daysUntil = (date: string) => {
  const now = new Date('2026-06-27T00:00:00')
  const deadline = new Date(`${date}T00:00:00`)
  return Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)
}

const salaryLabel = (job: Job) => {
  if (job.salaryMin && job.salaryMax) {
    return `${formatCurrency(job.salaryMin)}-${formatCurrency(job.salaryMax)}`
  }

  return job.salaryEstimate ?? 'Salary not disclosed'
}

type Filters = {
  query: string
  city: string
  policy: string
  seniority: string
  contract: string
  workMode: string
  language: string
  sort: string
}

const defaultFilters: Filters = {
  query: '',
  city: 'All locations',
  policy: 'All policy areas',
  seniority: 'All seniorities',
  contract: 'All contracts',
  workMode: 'All work modes',
  language: 'All languages',
  sort: 'Most relevant',
}

function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [activeJobId, setActiveJobId] = useState(jobs[0].id)
  const [savedJobs, setSavedJobs] = useState<string[]>(['climate-policy-manager'])
  const [activeView, setActiveView] = useState('jobs')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredJobs = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const result = jobs.filter((job) => {
      const searchable = [
        job.title,
        job.organisation,
        job.city,
        job.country,
        job.category,
        job.seniority,
        job.contractType,
        job.workMode,
        ...job.policyAreas,
        ...job.languages,
      ]
        .join(' ')
        .toLowerCase()

      return (
        (!query || searchable.includes(query)) &&
        (filters.city === 'All locations' || job.city === filters.city) &&
        (filters.policy === 'All policy areas' || job.policyAreas.includes(filters.policy)) &&
        (filters.seniority === 'All seniorities' || job.seniority === filters.seniority) &&
        (filters.contract === 'All contracts' || job.contractType === filters.contract) &&
        (filters.workMode === 'All work modes' || job.workMode === filters.workMode) &&
        (filters.language === 'All languages' || job.languages.includes(filters.language))
      )
    })

    if (filters.sort === 'Salary high to low') {
      return result.sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0))
    }

    if (filters.sort === 'Deadline soon') {
      return result.sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    }

    return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
  }, [filters])

  const activeJob = filteredJobs.find((job) => job.id === activeJobId) ?? filteredJobs[0] ?? jobs[0]

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    )
  }

  return (
    <main className="app-shell">
      <Header
        activeView={activeView}
        savedCount={savedJobs.length}
        onNavigate={setActiveView}
      />
      <Hero filters={filters} onFilterChange={updateFilter} onNavigate={setActiveView} />
      <ProductStats />
      <NavigationTabs activeView={activeView} onNavigate={setActiveView} />
      <section className="workspace" aria-live="polite">
        {activeView === 'jobs' && (
          <JobsView
            activeJob={activeJob}
            filters={filters}
            filteredJobs={filteredJobs}
            mobileFiltersOpen={mobileFiltersOpen}
            savedJobs={savedJobs}
            onActiveJob={setActiveJobId}
            onFilterChange={updateFilter}
            onResetFilters={() => setFilters(defaultFilters)}
            onToggleMobileFilters={setMobileFiltersOpen}
            onToggleSaved={toggleSavedJob}
          />
        )}
        {activeView === 'companies' && <CompaniesView onNavigate={setActiveView} />}
        {activeView === 'intelligence' && <IntelligenceView />}
        {activeView === 'salary' && <SalaryView />}
        {activeView === 'recruiters' && <RecruiterView />}
        {activeView === 'guides' && <GuidesView />}
      </section>
      <Footer />
    </main>
  )
}

export default App
