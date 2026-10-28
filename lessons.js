import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const MAX_LESSONS = 3
const MAX_LESSON_CHARS = 4000

export function readLessons(cwd, query = '') {
  const library = join(cwd, '.harness2', 'library')
  let dirs
  try {
    dirs = readdirSync(library, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return 'No Harness² library in this workspace.'
    throw error
  }

  const terms = query.slice(0, 200).toLowerCase().match(/[a-z0-9]+/g) ?? []
  const entries = []
  for (const dir of dirs) {
    if (!dir.isDirectory() || !/^[a-z0-9][a-z0-9-]*$/.test(dir.name)) continue
    const root = join(library, dir.name)
    try {
      const entryPath = join(root, 'entry.json')
      const lessonPath = join(root, 'lessons.md')
      if (!lstatSync(entryPath).isFile() || !lstatSync(lessonPath).isFile()) continue
      const entry = JSON.parse(readFileSync(entryPath, 'utf8'))
      if (!entry || typeof entry !== 'object' || entry.taskSlug !== dir.name || typeof entry.summary !== 'string' || typeof entry.created !== 'string') continue
      const lesson = readFileSync(lessonPath, 'utf8')
      const haystack = `${dir.name} ${entry.summary}`.toLowerCase()
      entries.push({
        slug: dir.name,
        summary: entry.summary.slice(0, 200),
        created: entry.created,
        score: terms.filter(term => haystack.includes(term)).length,
        lesson,
      })
    } catch (error) {
      if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error
    }
  }
  entries.sort((a, b) => b.score - a.score || b.created.localeCompare(a.created) || a.slug.localeCompare(b.slug))
  const selected = entries.slice(0, MAX_LESSONS)
  if (selected.length === 0) return 'No Harness² lessons in this workspace.'
  return selected.map(entry => {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(entry.lesson)?.[1] ?? ''
    const status = /^verified:\s*$/m.test(frontmatter) ? 'self-judged pass' : 'unverified'
    return `## ${entry.slug}: ${entry.summary} (${status})\n${entry.lesson.slice(0, MAX_LESSON_CHARS)}`
  }).join('\n\n')
}
