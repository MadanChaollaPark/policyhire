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

type JobsViewProps = {
  activeJob: Job
  filters: Filters
  filteredJobs: Job[]
  mobileFiltersOpen: boolean
  savedJobs: string[]
  onActiveJob: (jobId: string) => void
  onFilterChange: (key: keyof Filters, value: string) => void
  onResetFilters: () => void
  onToggleMobileFilters: (open: boolean) => void
  onToggleSaved: (jobId: string) => void
}

function JobsView({
  activeJob,
  filters,
  filteredJobs,
  mobileFiltersOpen,
  savedJobs,
  onActiveJob,
  onFilterChange,
  onResetFilters,
  onToggleMobileFilters,
  onToggleSaved,
}: JobsViewProps) {
  return (
    <div className="jobs-layout">
      <FiltersPanel
        filters={filters}
        resultCount={filteredJobs.length}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />
      <section className="results-column" aria-label="Job results">
        <div className="results-toolbar">
          <div>
            <span className="eyebrow compact-label">Live vacancies</span>
            <h2>{filteredJobs.length} EU affairs roles</h2>
          </div>
          <div className="toolbar-actions">
            <button
              className="secondary-button mobile-filter-button"
              type="button"
              onClick={() => onToggleMobileFilters(true)}
            >
              <Filter size={17} />
              Filters
            </button>
            <label className="sort-control">
              <Settings2 size={16} />
              <select
                value={filters.sort}
                onChange={(event) => onFilterChange('sort', event.target.value)}
                aria-label="Sort jobs"
              >
                <option>Most relevant</option>
                <option>Salary high to low</option>
                <option>Deadline soon</option>
              </select>
            </label>
          </div>
        </div>
        {filteredJobs.length > 0 ? (
          <div className="job-card-list">
            {filteredJobs.map((job) => (
              <JobCard
                active={job.id === activeJob.id}
                job={job}
                key={job.id}
                saved={savedJobs.includes(job.id)}
                onSelect={onActiveJob}
                onToggleSaved={onToggleSaved}
              />
            ))}
          </div>
        ) : (
          <EmptyJobsState onResetFilters={onResetFilters} />
        )}
      </section>
      <JobDetailPanel
        job={activeJob}
        saved={savedJobs.includes(activeJob.id)}
        onToggleSaved={onToggleSaved}
      />
      {mobileFiltersOpen && (
        <div className="drawer-backdrop" role="presentation" onClick={() => onToggleMobileFilters(false)}>
          <aside
            className="filter-drawer"
            aria-label="Mobile filters"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <strong>Filters</strong>
              <button
                className="icon-button"
                type="button"
                aria-label="Close filters"
                onClick={() => onToggleMobileFilters(false)}
              >
                <X size={18} />
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              resultCount={filteredJobs.length}
              onFilterChange={onFilterChange}
              onResetFilters={onResetFilters}
            />
            <button className="primary-button full-width" type="button" onClick={() => onToggleMobileFilters(false)}>
              Apply {filteredJobs.length} results
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}

type FiltersPanelProps = {
  filters: Filters
  resultCount: number
  onFilterChange: (key: keyof Filters, value: string) => void
  onResetFilters: () => void
}

function FiltersPanel({ filters, resultCount, onFilterChange, onResetFilters }: FiltersPanelProps) {
  return (
    <aside className="filters-panel" aria-label="Search filters">
      <div className="panel-heading">
        <span className="eyebrow compact-label">Facets</span>
        <strong>{resultCount} matches</strong>
      </div>
      <SelectControl
        icon={<MapPin size={16} />}
        label="Location"
        value={filters.city}
        options={['All locations', ...cities]}
        onChange={(value) => onFilterChange('city', value)}
      />
      <SelectControl
        icon={<Factory size={16} />}
        label="Policy area"
        value={filters.policy}
        options={['All policy areas', ...policyAreas]}
        onChange={(value) => onFilterChange('policy', value)}
      />
      <SelectControl
        icon={<Users size={16} />}
        label="Seniority"
        value={filters.seniority}
        options={['All seniorities', ...seniorities]}
        onChange={(value) => onFilterChange('seniority', value)}
      />
      <SelectControl
        icon={<BriefcaseBusiness size={16} />}
        label="Contract"
        value={filters.contract}
        options={['All contracts', ...contractTypes]}
        onChange={(value) => onFilterChange('contract', value)}
      />
      <SelectControl
        icon={<Globe2 size={16} />}
        label="Work mode"
        value={filters.workMode}
        options={['All work modes', ...workModes]}
        onChange={(value) => onFilterChange('workMode', value)}
      />
      <SelectControl
        icon={<Mail size={16} />}
        label="Language"
        value={filters.language}
        options={['All languages', ...languages]}
        onChange={(value) => onFilterChange('language', value)}
      />
      <button className="secondary-button full-width" type="button" onClick={onResetFilters}>
        Reset filters
      </button>
    </aside>
  )
}

type SelectControlProps = {
  icon: React.ReactNode
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function SelectControl({ icon, label, value, options, onChange }: SelectControlProps) {
  return (
    <label className="filter-control">
      <span>
        {icon}
        {label}
      </span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

type JobCardProps = {
  active: boolean
  job: Job
  saved: boolean
  onSelect: (jobId: string) => void
  onToggleSaved: (jobId: string) => void
}

function JobCard({ active, job, saved, onSelect, onToggleSaved }: JobCardProps) {
  const days = daysUntil(job.deadline)

  return (
    <article className={active ? 'job-card active' : 'job-card'}>
      <button className="job-main" type="button" onClick={() => onSelect(job.id)}>
        <span className="org-logo">{job.logo}</span>
        <span className="job-card-copy">
          <span className="job-title-line">
            <strong>{job.title}</strong>
            {job.verified && <ShieldCheck size={15} aria-label="Verified employer" />}
          </span>
          <span className="muted">{job.organisation}</span>
          <span className="job-meta">
            <span>
              <MapPin size={14} />
              {job.city}
            </span>
            <span>
              <BriefcaseBusiness size={14} />
              {job.contractType}
            </span>
            <span>
              <Globe2 size={14} />
              {job.workMode}
            </span>
          </span>
        </span>
      </button>
      <div className="job-card-side">
        <button
          className={saved ? 'save-button saved' : 'save-button'}
          type="button"
          aria-label={saved ? `Unsave ${job.title}` : `Save ${job.title}`}
          onClick={() => onToggleSaved(job.id)}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className={job.transparentSalary ? 'salary-pill verified' : 'salary-pill'}>
          <Euro size={14} />
          {salaryLabel(job)}
        </span>
        <span className={days <= 7 ? 'deadline-pill urgent' : 'deadline-pill'}>
          {days > 0 ? `${days} days left` : 'Expired'}
        </span>
      </div>
      <div className="tag-row">
        {job.policyAreas.slice(0, 3).map((area) => (
          <span className="tag" key={area}>
            {area}
          </span>
        ))}
        {job.paidInternship && <span className="tag success">Paid internship</span>}
        {job.featured && <span className="tag accent">Featured</span>}
      </div>
    </article>
  )
}

type JobDetailPanelProps = {
  job: Job
  saved: boolean
  onToggleSaved: (jobId: string) => void
}

function JobDetailPanel({ job, saved, onToggleSaved }: JobDetailPanelProps) {
  const org = organisations.find((organisation) => organisation.id === job.organisationId)

  return (
    <aside className="detail-panel" aria-label={`${job.title} details`}>
      <div className="detail-header">
        <span className="org-logo large">{job.logo}</span>
        <div>
          <span className="eyebrow compact-label">{job.organisation}</span>
          <h2>{job.title}</h2>
          <p>{job.summary}</p>
        </div>
      </div>
      <div className="detail-actions">
        <button className="primary-button" type="button">
          Apply via {job.applyType}
          <ExternalLink size={17} />
        </button>
        <button className="secondary-button" type="button" onClick={() => onToggleSaved(job.id)}>
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
      <div className="detail-grid">
        <DetailMetric icon={<Euro size={17} />} label="Salary" value={salaryLabel(job)} />
        <DetailMetric icon={<CalendarDays size={17} />} label="Deadline" value={job.deadline} />
        <DetailMetric icon={<MapPin size={17} />} label="Location" value={`${job.city}, ${job.country}`} />
        <DetailMetric icon={<ShieldCheck size={17} />} label="Right to work" value={job.visaNote} />
      </div>
      <section className="detail-section">
        <h3>Why this matches</h3>
        <div className="match-list">
          {job.matchReasons.map((reason) => (
            <span key={reason}>
              <Sparkles size={14} />
              {reason}
            </span>
          ))}
        </div>
      </section>
      <DetailList title="Responsibilities" items={job.responsibilities} />
      <DetailList title="Requirements" items={job.requirements} />
      <DetailList title="Benefits" items={job.benefits} />
      {org && (
        <section className="employer-strip">
          <div>
            <span className="eyebrow compact-label">Employer graph</span>
            <strong>{org.openRoles} open roles</strong>
            <p>{org.description}</p>
          </div>
          <span className="score-ring">{org.salaryTransparency}%</span>
        </section>
      )}
    </aside>
  )
}

type DetailMetricProps = {
  icon: React.ReactNode
  label: string
  value: string
}

function DetailMetric({ icon, label, value }: DetailMetricProps) {
  return (
    <div className="detail-metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type DetailListProps = {
  title: string
  items: string[]
}

function DetailList({ title, items }: DetailListProps) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function EmptyJobsState({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <section className="empty-state">
      <Search size={30} />
      <h2>No roles match this search</h2>
      <p>Broaden the filters or turn this search into a weekly alert for new listings.</p>
      <div className="empty-actions">
        <button className="primary-button" type="button">
          <Bell size={17} />
          Create alert
        </button>
        <button className="secondary-button" type="button" onClick={onResetFilters}>
          Clear filters
        </button>
      </div>
    </section>
  )
}

function CompaniesView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [typeFilter, setTypeFilter] = useState('All organisation types')
  const visibleOrganisations = organisations.filter(
    (organisation) => typeFilter === 'All organisation types' || organisation.type === typeFilter,
  )

  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Company directory"
        title="Verified EU affairs employers with hiring signals"
        description="Browse employers by type, policy area, salary transparency, and current hiring velocity."
        action={
          <label className="sort-control wide">
            <Building2 size={16} />
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter organisation type"
            >
              <option>All organisation types</option>
              {organisationTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
        }
      />
      <div className="company-grid">
        {visibleOrganisations.map((organisation) => (
          <article className="company-card" key={organisation.id}>
            <div className="company-card-header">
              <span className="org-logo large">{organisation.logo}</span>
              <div>
                <h3>{organisation.name}</h3>
                <span className="muted">
                  {organisation.type} · {organisation.city}
                </span>
              </div>
              {organisation.verified && <ShieldCheck size={18} aria-label="Verified employer" />}
            </div>
            <p>{organisation.description}</p>
            <div className="company-metrics">
              <span>
                <BriefcaseBusiness size={15} />
                {organisation.openRoles} roles
              </span>
              <span>
                <TrendingUp size={15} />
                {organisation.hiringVelocity} velocity
              </span>
              <span>
                <Euro size={15} />
                {organisation.salaryTransparency}% pay signal
              </span>
            </div>
            <div className="tag-row">
              {organisation.policyAreas.map((area) => (
                <span className="tag" key={area}>
                  {area}
                </span>
              ))}
            </div>
            <div className="badge-list">
              {organisation.badges.map((badge) => (
                <span key={badge}>
                  <CheckCircle2 size={14} />
                  {badge}
                </span>
              ))}
            </div>
            <button className="secondary-button full-width" type="button" onClick={() => onNavigate('jobs')}>
              View open roles
              <ChevronRight size={17} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}

function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow compact-label">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}

export default App
