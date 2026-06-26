import { describe, expect, it } from 'vitest'
import { jobs } from './data'
import { daysUntil, filterJobs, salaryLabel } from './search'
import type { JobFilters } from './types'

const baseFilters: JobFilters = {
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

describe('job search helpers', () => {
  it('formats salary ranges when structured salary is available', () => {
    expect(salaryLabel(jobs[0])).toBe('€68,000-€82,000')
  })

  it('matches keyword searches across policy metadata', () => {
    const result = filterJobs(jobs, { ...baseFilters, query: 'digital rights' })

    expect(result.map((job) => job.id)).toContain('digital-rights-legal-officer')
  })

  it('filters by city and contract type together', () => {
    const result = filterJobs(jobs, {
      ...baseFilters,
      city: 'Brussels',
      contract: 'Internship',
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('transport-trainee')
  })

  it('sorts deadline soon using the fixed launch reference date', () => {
    const result = filterJobs(jobs, { ...baseFilters, sort: 'Deadline soon' })

    expect(result[0].id).toBe('transport-trainee')
    expect(daysUntil(result[0].deadline)).toBe(4)
  })

  it('sorts structured salaries from high to low', () => {
    const result = filterJobs(jobs, { ...baseFilters, sort: 'Salary high to low' })

    expect(result[0].id).toBe('financial-services-adviser')
  })
})
