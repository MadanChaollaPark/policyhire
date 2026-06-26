import { copyFileSync, mkdirSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')

const routes = [
  'jobs',
  'alerts',
  'saved',
  'profile',
  'companies',
  'lobbying-entities',
  'fair-pay',
  'career-guides',
  'post-job',
  'admin',
  'brussels-best',
  'internship-calendar',
  'jobs/brussels',
  'jobs/remote-eu',
  'jobs/climate-energy',
  'jobs/digital-policy',
  'jobs/traineeships',
]

for (const route of routes) {
  const directory = `dist/${route}`
  mkdirSync(directory, { recursive: true })
  copyFileSync('dist/index.html', `${directory}/index.html`)
}
