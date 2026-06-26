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

type HeaderProps = {
  activeView: string
  savedCount: number
  onNavigate: (view: string) => void
}

function Header({ activeView, savedCount, onNavigate }: HeaderProps) {
  const navItems = [
    ['jobs', 'Find Jobs'],
    ['companies', 'Companies'],
    ['intelligence', 'Lobbying Intel'],
    ['salary', 'Fair Pay'],
    ['recruiters', 'Post a Job'],
    ['guides', 'Guides'],
  ]

  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('jobs')}>
        <span className="brand-mark">EU</span>
        <span>
          <strong>PolicyHire</strong>
          <small>EU affairs careers</small>
        </span>
      </button>
      <nav className="top-nav" aria-label="Primary navigation">
        {navItems.map(([id, label]) => (
          <button
            className={activeView === id ? 'nav-link active' : 'nav-link'}
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="header-actions">
        <button className="icon-button" type="button" aria-label={`${savedCount} saved jobs`}>
          <Bookmark size={18} />
          <span>{savedCount}</span>
        </button>
        <button className="primary-button compact" type="button" onClick={() => onNavigate('recruiters')}>
          <BriefcaseBusiness size={17} />
          Recruit
        </button>
        <button className="icon-button menu-button" type="button" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}

type HeroProps = {
  filters: Filters
  onFilterChange: (key: keyof Filters, value: string) => void
  onNavigate: (view: string) => void
}

function Hero({ filters, onFilterChange, onNavigate }: HeroProps) {
  return (
    <section className="hero-section">
      <img className="hero-image" src={euCareersBanner} alt="" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-copy">
          <span className="eyebrow">
            <ShieldCheck size={16} />
            Verified EU affairs jobs, salaries, and employers
          </span>
          <h1>Find serious EU policy jobs without the Brussels clutter.</h1>
          <p>
            Search public affairs, EU institution, NGO, trade association, law, media, and
            traineeship roles with salary signals and deadline integrity.
          </p>
        </div>
        <div className="hero-search" role="search">
          <label className="search-field">
            <Search size={18} />
            <input
              value={filters.query}
              onChange={(event) => onFilterChange('query', event.target.value)}
              placeholder="Policy area, job title, organisation"
              aria-label="Search jobs"
            />
          </label>
          <label className="select-field">
            <MapPin size={18} />
            <select
              value={filters.city}
              onChange={(event) => onFilterChange('city', event.target.value)}
              aria-label="Location"
            >
              <option>All locations</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="button" onClick={() => onNavigate('jobs')}>
            <Search size={18} />
            Search
          </button>
        </div>
        <div className="quick-links" aria-label="Popular searches">
          {['Paid internships', 'Climate policy', 'Remote EU', 'Deadline soon'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (item === 'Remote EU') onFilterChange('city', 'Remote EU')
                else onFilterChange('query', item)
                onNavigate('jobs')
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductStats() {
  const stats = [
    ['184', 'verified live roles'],
    ['642', 'employer profiles'],
    ['12.7k', 'transparency entities'],
    ['76%', 'jobs with pay signal'],
  ]

  return (
    <section className="stats-band" aria-label="Platform metrics">
      {stats.map(([value, label]) => (
        <div className="stat-item" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  )
}

type NavigationTabsProps = {
  activeView: string
  onNavigate: (view: string) => void
}

function NavigationTabs({ activeView, onNavigate }: NavigationTabsProps) {
  const tabs = [
    ['jobs', Search, 'Jobs'],
    ['companies', Building2, 'Companies'],
    ['intelligence', Globe2, 'Intel'],
    ['salary', Euro, 'Fair Pay'],
    ['recruiters', Megaphone, 'Recruiters'],
    ['guides', FileText, 'Guides'],
  ] as const

  return (
    <div className="tab-rail" role="tablist" aria-label="Product sections">
      {tabs.map(([id, Icon, label]) => (
        <button
          aria-selected={activeView === id}
          className={activeView === id ? 'tab-button active' : 'tab-button'}
          key={id}
          role="tab"
          type="button"
          onClick={() => onNavigate(id)}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  )
}

export default App
