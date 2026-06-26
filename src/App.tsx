import { type ReactNode, useEffect, useMemo, useState } from 'react'
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
  Upload,
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
  alertPreferences,
  postingRequirements,
  recruiterMetrics,
  brusselsBest,
  salaryBands,
  seniorities,
  transparencyEntities,
  workModes,
} from './data'
import { daysUntil, filterJobs, formatCurrency, salaryLabel } from './search'
import type { Job, JobFilters } from './types'
import './App.css'

const defaultFilters: JobFilters = {
  query: '',
  city: 'All locations',
  policy: 'All policy areas',
  category: 'All categories',
  seniority: 'All seniorities',
  contract: 'All contracts',
  workMode: 'All work modes',
  language: 'All languages',
  deadline: 'Any deadline',
  pay: 'Any pay signal',
  sort: 'Most relevant',
}

const navItems = [
  ['jobs', 'Jobs'],
  ['alerts', 'Alerts'],
  ['saved', 'Saved'],
  ['profile', 'Profile/CV'],
  ['companies', 'Companies'],
  ['intelligence', 'Entities'],
  ['salary', 'Salary'],
  ['guides', 'Guides'],
  ['recruiters', 'Post a Job'],
  ['admin', 'Admin'],
]

const routeByView: Record<string, string> = {
  jobs: '/jobs',
  alerts: '/alerts',
  saved: '/saved',
  profile: '/profile',
  companies: '/companies',
  intelligence: '/lobbying-entities',
  salary: '/fair-pay',
  guides: '/career-guides',
  recruiters: '/post-job',
  admin: '/admin',
}

const viewByRoute = Object.fromEntries(
  Object.entries(routeByView).map(([view, path]) => [path, view]),
)

const routeBase = import.meta.env.BASE_URL.replace(/\/$/, '')

const viewFromPath = () => {
  const path = window.location.pathname.replace(routeBase, '') || '/jobs'
  return viewByRoute[path] ?? 'jobs'
}

function App() {
  const [filters, setFilters] = useState<JobFilters>(defaultFilters)
  const [activeJobId, setActiveJobId] = useState(jobs[0].id)
  const [savedJobs, setSavedJobs] = useState<string[]>(['climate-policy-manager'])
  const [activeView, setActiveView] = useState(viewFromPath)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileFiltersOpen && !mobileMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileFiltersOpen(false)
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileFiltersOpen, mobileMenuOpen])

  useEffect(() => {
    const syncRoute = () => setActiveView(viewFromPath())

    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  const filteredJobs = useMemo(() => {
    let matches = filterJobs(jobs, filters)

    if (filters.deadline === 'Closing this week') {
      matches = matches.filter((job) => daysUntil(job.deadline) <= 7)
    }

    if (filters.deadline === 'Closing this month') {
      matches = matches.filter((job) => daysUntil(job.deadline) <= 30)
    }

    if (filters.pay === 'Salary disclosed') {
      matches = matches.filter((job) => job.transparentSalary)
    }

    if (filters.pay === 'Paid internship') {
      matches = matches.filter((job) => job.paidInternship)
    }

    return matches
  }, [filters])

  const activeJob = filteredJobs.find((job) => job.id === activeJobId) ?? filteredJobs[0]

  const updateFilter = (key: keyof JobFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const applyFilters = (partial: Partial<JobFilters>) => {
    setFilters((current) => ({ ...current, ...partial }))
  }

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    )
  }

  const navigate = (view: string) => {
    setActiveView(view)
    setMobileMenuOpen(false)
    const path = `${routeBase}${routeByView[view] ?? '/jobs'}`
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
  }

  return (
    <main className="app-shell">
      <Header
        activeView={activeView}
        mobileMenuOpen={mobileMenuOpen}
        savedCount={savedJobs.length}
        onNavigate={navigate}
        onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
      />
      <CommandCenter
        filters={filters}
        resultCount={filteredJobs.length}
        savedCount={savedJobs.length}
        onApplyFilters={applyFilters}
        onFilterChange={updateFilter}
        onNavigate={navigate}
      />
      <NavigationTabs activeView={activeView} onNavigate={navigate} />
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
        {activeView === 'alerts' && <AlertsView filters={filters} />}
        {activeView === 'saved' && (
          <SavedJobsView
            savedJobs={savedJobs}
            onNavigate={navigate}
            onToggleSaved={toggleSavedJob}
          />
        )}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'companies' && <CompaniesView onNavigate={navigate} />}
        {activeView === 'intelligence' && <IntelligenceView />}
        {activeView === 'salary' && <SalaryView />}
        {activeView === 'recruiters' && <RecruiterView />}
        {activeView === 'guides' && <GuidesView />}
        {activeView === 'admin' && <AdminView />}
      </section>
      <Footer />
    </main>
  )
}

type HeaderProps = {
  activeView: string
  mobileMenuOpen: boolean
  savedCount: number
  onNavigate: (view: string) => void
  onToggleMobileMenu: () => void
}

function Header({ activeView, mobileMenuOpen, savedCount, onNavigate, onToggleMobileMenu }: HeaderProps) {
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
            aria-current={activeView === id ? 'page' : undefined}
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
        <button
          className="icon-button"
          type="button"
          aria-label={`${savedCount} saved jobs`}
          onClick={() => onNavigate('saved')}
        >
          <Bookmark size={18} />
          <span>{savedCount}</span>
        </button>
        <button className="primary-button compact" type="button" onClick={() => onNavigate('recruiters')}>
          <BriefcaseBusiness size={17} />
          Recruit
        </button>
        <button
          aria-expanded={mobileMenuOpen}
          className="icon-button menu-button"
          type="button"
          aria-label="Open menu"
          onClick={onToggleMobileMenu}
        >
          <Menu size={20} />
        </button>
      </div>
      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map(([id, label]) => (
            <button
              aria-current={activeView === id ? 'page' : undefined}
              className={activeView === id ? 'nav-link active' : 'nav-link'}
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

type CommandCenterProps = {
  filters: JobFilters
  resultCount: number
  savedCount: number
  onApplyFilters: (partial: Partial<JobFilters>) => void
  onFilterChange: (key: keyof JobFilters, value: string) => void
  onNavigate: (view: string) => void
}

function CommandCenter({
  filters,
  resultCount,
  savedCount,
  onApplyFilters,
  onFilterChange,
  onNavigate,
}: CommandCenterProps) {
  const paySignalPercent = Math.round(
    (jobs.filter((job) => job.transparentSalary || job.salaryEstimate).length / jobs.length) * 100,
  )

  return (
    <section className="command-center">
      <div className="command-main">
        <div className="command-title">
          <span className="eyebrow">
            <ShieldCheck size={15} />
            EU affairs hiring workspace
          </span>
          <h1>Search verified EU policy jobs, employers, salaries, and lobbying entities.</h1>
        </div>
        <div className="command-search" role="search">
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
          <label className="select-field">
            <Factory size={18} />
            <select
              value={filters.policy}
              onChange={(event) => onFilterChange('policy', event.target.value)}
              aria-label="Policy area"
            >
              <option>All policy areas</option>
              {policyAreas.map((area) => (
                <option key={area}>{area}</option>
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
                if (item === 'Paid internships') {
                  onApplyFilters({ contract: 'Internship', pay: 'Paid internship', query: '' })
                } else if (item === 'Climate policy') {
                  onApplyFilters({ policy: 'Climate & Energy', query: '' })
                } else if (item === 'Remote EU') {
                  onApplyFilters({ city: 'Remote EU', workMode: 'Remote' })
                } else if (item === 'Deadline soon') {
                  onApplyFilters({ deadline: 'Closing this week', sort: 'Deadline soon' })
                }
                onNavigate('jobs')
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="command-side">
        <div className="market-card">
          <img src={euCareersBanner} alt="" />
          <div>
            <span className="eyebrow compact-label">Live market</span>
            <strong>{resultCount} matching roles</strong>
            <span>{savedCount} saved · {paySignalPercent}% with pay signal</span>
          </div>
        </div>
        <div className="action-grid" aria-label="Candidate and recruiter actions">
          <button type="button" onClick={() => onNavigate('alerts')}>
            <Bell size={17} />
            Alerts
          </button>
          <button type="button" onClick={() => onNavigate('profile')}>
            <Upload size={17} />
            CV profile
          </button>
          <button type="button" onClick={() => onNavigate('companies')}>
            <Building2 size={17} />
            Employers
          </button>
          <button type="button" onClick={() => onNavigate('recruiters')}>
            <Megaphone size={17} />
            Post job
          </button>
        </div>
      </div>
      <div className="metric-strip" aria-label="Platform metrics">
        {[
          [String(jobs.length), 'seeded live roles'],
          [String(organisations.length), 'employer profiles'],
          [String(transparencyEntities.length), 'sample entities'],
          [String(alertPreferences.length), 'alert controls'],
        ].map(([value, label]) => (
          <span key={label}>
            <strong>{value}</strong>
            {label}
          </span>
        ))}
      </div>
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
    ['alerts', Bell, 'Alerts'],
    ['saved', Bookmark, 'Saved'],
    ['profile', Upload, 'Profile'],
    ['companies', Building2, 'Companies'],
    ['intelligence', Globe2, 'Entities'],
    ['salary', Euro, 'Salary'],
    ['guides', FileText, 'Guides'],
    ['recruiters', Megaphone, 'Post Job'],
    ['admin', ClipboardCheck, 'Admin'],
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
  activeJob: Job | undefined
  filters: JobFilters
  filteredJobs: Job[]
  mobileFiltersOpen: boolean
  savedJobs: string[]
  onActiveJob: (jobId: string) => void
  onFilterChange: (key: keyof JobFilters, value: string) => void
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
        <ActiveFilters
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
        {filteredJobs.length > 0 ? (
          <div className="job-card-list">
            {filteredJobs.map((job) => (
              <JobCard
                active={job.id === activeJob?.id}
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
      {activeJob ? (
        <JobDetailPanel
          job={activeJob}
          saved={savedJobs.includes(activeJob.id)}
          onToggleSaved={onToggleSaved}
        />
      ) : (
        <UtilityRail savedCount={savedJobs.length} />
      )}
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

type ActiveFiltersProps = {
  filters: JobFilters
  onFilterChange: (key: keyof JobFilters, value: string) => void
  onResetFilters: () => void
}

function ActiveFilters({ filters, onFilterChange, onResetFilters }: ActiveFiltersProps) {
  const allChips: Array<[keyof JobFilters, string, string]> = [
    ['city', filters.city, 'All locations'],
    ['policy', filters.policy, 'All policy areas'],
    ['category', filters.category, 'All categories'],
    ['seniority', filters.seniority, 'All seniorities'],
    ['contract', filters.contract, 'All contracts'],
    ['workMode', filters.workMode, 'All work modes'],
    ['language', filters.language, 'All languages'],
    ['deadline', filters.deadline, 'Any deadline'],
    ['pay', filters.pay, 'Any pay signal'],
  ]
  const chips = allChips.filter(([, value, emptyValue]) => value !== emptyValue)

  if (!filters.query && chips.length === 0) {
    return (
      <div className="active-filter-row">
        <span className="filter-chip neutral">Showing all verified roles</span>
        <button className="filter-chip action" type="button">
          <Bell size={14} />
          Create alert
        </button>
      </div>
    )
  }

  return (
    <div className="active-filter-row" aria-label="Active filters">
      {filters.query && (
        <button
          className="filter-chip"
          type="button"
          onClick={() => onFilterChange('query', '')}
        >
          {filters.query}
          <X size={13} />
        </button>
      )}
      {chips.map(([key, value, emptyValue]) => (
        <button
          className="filter-chip"
          key={`${key}-${value}`}
          type="button"
          onClick={() => onFilterChange(key, emptyValue)}
        >
          {value}
          <X size={13} />
        </button>
      ))}
      <button className="filter-chip action" type="button" onClick={onResetFilters}>
        Clear all
      </button>
    </div>
  )
}

type FiltersPanelProps = {
  filters: JobFilters
  resultCount: number
  onFilterChange: (key: keyof JobFilters, value: string) => void
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
        icon={<BriefcaseBusiness size={16} />}
        label="Category"
        value={filters.category}
        options={['All categories', ...categories]}
        onChange={(value) => onFilterChange('category', value)}
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
      <SelectControl
        icon={<CalendarDays size={16} />}
        label="Deadline"
        value={filters.deadline}
        options={['Any deadline', 'Closing this week', 'Closing this month']}
        onChange={(value) => onFilterChange('deadline', value)}
      />
      <SelectControl
        icon={<Euro size={16} />}
        label="Pay signal"
        value={filters.pay}
        options={['Any pay signal', 'Salary disclosed', 'Paid internship']}
        onChange={(value) => onFilterChange('pay', value)}
      />
      <button className="secondary-button full-width" type="button" onClick={onResetFilters}>
        Reset filters
      </button>
    </aside>
  )
}

type SelectControlProps = {
  icon: ReactNode
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
      <button
        aria-current={active ? 'true' : undefined}
        className="job-main"
        type="button"
        onClick={() => onSelect(job.id)}
      >
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
  icon: ReactNode
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

function UtilityRail({ savedCount }: { savedCount: number }) {
  return (
    <aside className="utility-rail" aria-label="Candidate tools">
      <article className="utility-card">
        <span className="eyebrow compact-label">Candidate tools</span>
        <h3>Keep your search moving</h3>
        <div className="mini-metrics">
          <span><strong>{savedCount}</strong> saved jobs</span>
          <span><strong>3</strong> active alerts</span>
          <span><strong>62%</strong> profile strength</span>
        </div>
        <button className="secondary-button full-width" type="button">
          <Bell size={16} />
          Manage alerts
        </button>
      </article>
      <article className="utility-card">
        <span className="eyebrow compact-label">Hiring?</span>
        <h3>Reach EU policy candidates</h3>
        <p>Featured campaigns include alerts, newsletter placement, and source analytics.</p>
        <button className="primary-button full-width" type="button">
          <Megaphone size={16} />
          Post a job
        </button>
      </article>
    </aside>
  )
}

function AlertsView({ filters }: { filters: JobFilters }) {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Alerts"
        title="Create preference-rich EU affairs job alerts"
        description="Build alerts from the current search, then tune frequency, salary visibility, seniority, policy area, employer follows, and deadline reminders."
      />
      <div className="content-grid">
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Current search</span>
              <h3>{filters.query || filters.policy.replace('All policy areas', 'All EU policy roles')}</h3>
            </div>
            <Bell size={24} />
          </div>
          <div className="alert-builder">
            {[
              `Location: ${filters.city}`,
              `Policy: ${filters.policy}`,
              `Seniority: ${filters.seniority}`,
              `Pay: ${filters.pay}`,
              'Frequency: instant, daily, or weekly',
              'Channels: email, newsletter, deadline reminder',
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
            <button className="primary-button full-width" type="button">Create alert</button>
          </div>
        </article>
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Alert inbox</span>
              <h3>3 active alerts</h3>
            </div>
            <Mail size={24} />
          </div>
          <div className="queue-list">
            {['Digital policy · Brussels · weekly', 'Climate & Energy · Remote EU · instant', 'Traineeships · paid only · daily'].map((alert) => (
              <div className="queue-item risk-low" key={alert}>
                <span>Active</span>
                <strong>{alert}</strong>
                <small>Matching roles monitored across jobs, employers, and entities.</small>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function SavedJobsView({
  savedJobs,
  onNavigate,
  onToggleSaved,
}: {
  savedJobs: string[]
  onNavigate: (view: string) => void
  onToggleSaved: (jobId: string) => void
}) {
  const saved = jobs.filter((job) => savedJobs.includes(job.id))

  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Saved jobs"
        title="Track saved, applied, interviewing, and archived roles"
        description="Candidate workflow parity for shortlisting, deadline reminders, notes, and application status."
        action={<button className="primary-button" type="button" onClick={() => onNavigate('jobs')}>Back to jobs</button>}
      />
      {saved.length > 0 ? (
        <div className="pipeline-grid">
          {['Saved', 'Applied', 'Interviewing', 'Archived'].map((stage, index) => (
            <article className="feature-panel" key={stage}>
              <span className="eyebrow compact-label">{stage}</span>
              {index === 0 ? saved.map((job) => (
                <div className="pipeline-card" key={job.id}>
                  <strong>{job.title}</strong>
                  <span>{job.organisation} · {job.city}</span>
                  <small>{salaryLabel(job)} · closes in {daysUntil(job.deadline)} days</small>
                  <button className="text-button" type="button" onClick={() => onToggleSaved(job.id)}>
                    Remove
                  </button>
                </div>
              )) : <p className="muted">No roles in this stage yet.</p>}
            </article>
          ))}
        </div>
      ) : (
        <EmptyJobsState onResetFilters={() => onNavigate('jobs')} />
      )}
    </section>
  )
}

function ProfileView() {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="CV profile"
        title="Candidate profile built for EU affairs recruiting"
        description="Show policy interests, language profile, institution exposure, salary expectations, visibility, and recruiter discoverability."
      />
      <div className="profile-grid">
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Profile strength</span>
              <h3>62% complete</h3>
            </div>
            <Upload size={24} />
          </div>
          <div className="range-track profile-track" aria-hidden="true"><span /></div>
          <div className="check-grid compact-grid">
            {['CV uploaded', 'Policy interests selected', 'Languages added', 'Salary expectation missing', 'Right-to-work note missing'].map((item) => (
              <span key={item}><CheckCircle2 size={15} />{item}</span>
            ))}
          </div>
          <button className="primary-button full-width" type="button">Upload CV</button>
        </article>
        <article className="feature-panel">
          <span className="eyebrow compact-label">Recruiter preview</span>
          <h3>EU digital policy officer</h3>
          <p>Interests: AI Act, DSA, competition, platform accountability. Languages: English, French. Preferences: Brussels or Remote EU, hybrid, salary disclosed.</p>
          <div className="tag-row">
            <span className="tag">Recruiter searchable</span>
            <span className="tag success">Salary preference visible</span>
            <span className="tag accent">Open to alerts</span>
          </div>
        </article>
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
  action?: ReactNode
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

function IntelligenceView() {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Lobbying intelligence"
        title="Turn directories into hiring intelligence"
        description="Search EU Transparency Register style entities, related jobs, public-affairs suppliers, and career-guide pathways from one place."
      />
      <div className="intelligence-grid">
        <article className="feature-panel wide-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Entity search</span>
              <h3>12,688 mapped entities</h3>
            </div>
            <Globe2 size={24} />
          </div>
          <div className="entity-list">
            {transparencyEntities.map((entity) => (
              <div className="entity-row" key={entity.name}>
                <div>
                  <strong>{entity.name}</strong>
                  <span className="muted">
                    {entity.type} · {entity.country} · registered {entity.registered}
                  </span>
                  <div className="tag-row">
                    {entity.interests.map((interest) => (
                      <span className="tag" key={interest}>
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="entity-side">
                  <span>{entity.spend}</span>
                  <strong>{entity.relatedJobs} related jobs</strong>
                  <small>{entity.hiringSignal}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Quality checks</span>
              <h3>No ghost jobs queue</h3>
            </div>
            <ClipboardCheck size={24} />
          </div>
          <ul className="check-list">
            <li>Duplicate apply-link detection</li>
            <li>Expired deadline sweeps</li>
            <li>Unpaid internship warnings</li>
            <li>Salary contradiction review</li>
            <li>AI-generated application blocking flag</li>
          </ul>
        </article>
      </div>
      <div className="supplier-grid">
        {brusselsBest.map((item) => (
          <article className="supplier-card" key={item.category}>
            <span className="count-badge">{item.count}</span>
            <h3>{item.category}</h3>
            <p>{item.standout}</p>
            <button className="text-button" type="button">
              Browse category
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function SalaryView() {
  const transparentJobs = jobs.filter((job) => job.transparentSalary || job.salaryEstimate)

  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Fair Pay"
        title="Salary signals that go beyond static bands"
        description="Compare role, city, seniority, sample size, and listing-level pay disclosure before applying."
      />
      <div className="salary-grid">
        {salaryBands.map((band) => (
          <article className="salary-card" key={`${band.role}-${band.city}`}>
            <div className="panel-title-row">
              <div>
                <h3>{band.role}</h3>
                <span className="muted">
                  {band.city} · {band.seniority} · {band.sample} samples
                </span>
              </div>
              <Euro size={22} />
            </div>
            <div className="salary-range">
              <span>{formatCurrency(band.low)}</span>
              <strong>{formatCurrency(band.median)}</strong>
              <span>{formatCurrency(band.high)}</span>
            </div>
            <div className="range-track" aria-hidden="true">
              <span
                style={{
                  width: `${Math.round(((band.median - band.low) / (band.high - band.low)) * 100)}%`,
                }}
              />
            </div>
            <p>Median sits {Math.round(((band.median - band.low) / (band.high - band.low)) * 100)}% through the observed range.</p>
          </article>
        ))}
      </div>
      <article className="feature-panel">
        <div className="panel-title-row">
          <div>
            <span className="eyebrow compact-label">Disclosure-first jobs</span>
            <h3>{transparentJobs.length} current listings with pay signals</h3>
          </div>
          <LineChart size={24} />
        </div>
        <div className="pay-table">
          {transparentJobs.slice(0, 6).map((job) => (
            <div className="pay-row" key={job.id}>
              <span>{job.title}</span>
              <strong>{salaryLabel(job)}</strong>
              <small>{job.organisation}</small>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

function RecruiterView() {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Recruiter suite"
        title="Post better EU affairs jobs with transparent performance"
        description="Guided posting, salary prompts, featured campaigns, alert distribution, hosted apply forms, and moderation feedback."
      />
      <div className="pricing-grid">
        {pricingPlans.map((plan) => (
          <article className={plan.highlight ? 'pricing-card highlighted' : 'pricing-card'} key={plan.name}>
            <span className="eyebrow compact-label">{plan.highlight ? 'Most useful' : 'Package'}</span>
            <h3>{plan.name}</h3>
            <strong className="price">{plan.price}</strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={15} />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="tag-row">
              {plan.addOns.map((addOn) => (
                <span className="tag accent" key={addOn}>
                  {addOn}
                </span>
              ))}
            </div>
            <button className="primary-button full-width" type="button">
              Start posting
            </button>
          </article>
        ))}
      </div>
      <div className="recruiter-grid">
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Campaign analytics</span>
              <h3>Recruiter dashboard</h3>
            </div>
            <BarChart3 size={24} />
          </div>
          <div className="metric-grid">
            {recruiterMetrics.map((metric) => (
              <div className="metric-tile" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.change}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Guided posting</span>
              <h3>Quality score inputs</h3>
            </div>
            <ClipboardCheck size={24} />
          </div>
          <div className="check-grid compact-grid">
            {postingRequirements.map((requirement) => (
              <span key={requirement}>
                <CheckCircle2 size={15} />
                {requirement}
              </span>
            ))}
          </div>
        </article>
      </div>
      <div className="recruiter-grid">
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Moderation queue</span>
              <h3>Quality control</h3>
            </div>
            <Eye size={24} />
          </div>
          <div className="queue-list">
            {adminQueue.map((item) => (
              <div className={`queue-item risk-${item.risk.toLowerCase()}`} key={item.id}>
                <span>{item.type}</span>
                <strong>{item.label}</strong>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function GuidesView() {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Career guides"
        title="Content that compounds with job search"
        description="Internship cycles, career guides, salary reports, recruiter playbooks, and SEO-ready long-tail landing pages."
      />
      <div className="content-grid">
        <article className="feature-panel wide-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Internship calendar</span>
              <h3>Recurring EU traineeship windows</h3>
            </div>
            <CalendarDays size={24} />
          </div>
          <div className="cycle-list">
            {internshipCycles.map((cycle) => (
              <div className="cycle-row" key={cycle.name}>
                <div>
                  <strong>{cycle.name}</strong>
                  <span className="muted">{cycle.organiser}</span>
                  <p>{cycle.notes}</p>
                </div>
                <div>
                  <span>{cycle.window}</span>
                  <strong>{cycle.start}</strong>
                  <small>{cycle.paid ? 'Paid' : 'Unpaid'}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Alerts</span>
              <h3>Saved search digest</h3>
            </div>
            <Bell size={24} />
          </div>
          <div className="alert-builder">
            {alertPreferences.map((preference) => (
              <span key={preference}>{preference}</span>
            ))}
            <button className="primary-button full-width" type="button">
              Create alert
            </button>
          </div>
        </article>
      </div>
      <div className="guide-grid">
        {guides.map((guide) => (
          <article className="guide-card" key={guide.title}>
            <span className="eyebrow compact-label">{guide.tag}</span>
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
            <span className="muted">{guide.readTime}</span>
          </article>
        ))}
      </div>
      <article className="feature-panel">
        <div className="panel-title-row">
          <div>
            <span className="eyebrow compact-label">Launch checklist</span>
            <h3>Feature parity plus competitive gaps</h3>
          </div>
          <Star size={24} />
        </div>
        <div className="check-grid">
          {featureChecklist.map((feature) => (
            <span key={feature}>
              <CheckCircle2 size={15} />
              {feature}
            </span>
          ))}
        </div>
      </article>
    </section>
  )
}

function AdminView() {
  return (
    <section className="section-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Moderate jobs, employers, salary data, entities, and content"
        description="Operational parity for approval queues, flagged listings, employer verification, taxonomy hygiene, salary benchmarks, and revenue monitoring."
      />
      <div className="metric-grid admin-metrics">
        {[
          ['17', 'pending jobs'],
          ['6', 'flagged listings'],
          ['42', 'employer updates'],
          ['EUR 38.4k', 'campaign revenue'],
        ].map(([value, label]) => (
          <div className="metric-tile" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <small>Needs review</small>
          </div>
        ))}
      </div>
      <div className="recruiter-grid">
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Moderation</span>
              <h3>Review queue</h3>
            </div>
            <ClipboardCheck size={24} />
          </div>
          <div className="queue-list">
            {adminQueue.map((item) => (
              <div className={`queue-item risk-${item.risk.toLowerCase()}`} key={item.id}>
                <span>{item.type}</span>
                <strong>{item.label}</strong>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="feature-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow compact-label">Data operations</span>
              <h3>Quality tooling</h3>
            </div>
            <Settings2 size={24} />
          </div>
          <div className="check-grid compact-grid">
            {[
              'Salary normalization',
              'Duplicate detection',
              'Broken apply-link checks',
              'Entity taxonomy cleanup',
              'Career-guide CMS',
              'Employer CRM notes',
            ].map((item) => (
              <span key={item}>
                <CheckCircle2 size={15} />
                {item}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>PolicyHire</strong>
        <span>EU affairs jobs, employer intelligence, and fair-pay signals.</span>
      </div>
      <div className="footer-links">
        <span>JobPosting schema</span>
        <span>Organization schema</span>
        <span>Open Graph</span>
        <span>Robots: search=yes, ai-train=no</span>
      </div>
    </footer>
  )
}

export default App
