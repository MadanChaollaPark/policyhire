import type { Job, JobFilters } from './types'

const referenceDate = new Date('2026-06-27T00:00:00')

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)

export const daysUntil = (date: string) => {
  const deadline = new Date(`${date}T00:00:00`)
  return Math.ceil((deadline.getTime() - referenceDate.getTime()) / 86_400_000)
}

export const salaryLabel = (job: Job) => {
  if (job.salaryMin && job.salaryMax) {
    return `${formatCurrency(job.salaryMin)}-${formatCurrency(job.salaryMax)}`
  }

  return job.salaryEstimate ?? 'Salary not disclosed'
}

export const filterJobs = (jobs: Job[], filters: JobFilters) => {
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
      (filters.category === 'All categories' || job.category === filters.category) &&
      (filters.seniority === 'All seniorities' || job.seniority === filters.seniority) &&
      (filters.contract === 'All contracts' || job.contractType === filters.contract) &&
      (filters.workMode === 'All work modes' || job.workMode === filters.workMode) &&
      (filters.language === 'All languages' || job.languages.includes(filters.language))
    )
  })

  if (filters.sort === 'Salary high to low') {
    return [...result].sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0))
  }

  if (filters.sort === 'Deadline soon') {
    return [...result].sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
  }

  return [...result].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
}
