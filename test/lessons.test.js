import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { readLessons } from '../lessons.js'

test('reads and ranks bounded lessons without following symlinked files', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'h2-lessons-'))
  try {
    const library = join(cwd, '.harness2', 'library')
    for (const [slug, created, lesson] of [
      ['other-task', '2026-10-27', 'other lesson'],
      ['login-test', '2026-10-26', '---\nverified:\n  - by: probe\n---\nCheck login tests'],
    ]) {
      const dir = join(library, slug)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'entry.json'), JSON.stringify({ taskSlug: slug, summary: slug, created }))
      writeFileSync(join(dir, 'lessons.md'), lesson)
    }
    mkdirSync(join(library, 'bad-link'))
    writeFileSync(join(cwd, 'secret'), 'secret data')
    writeFileSync(join(library, 'bad-link', 'entry.json'), JSON.stringify({ taskSlug: 'bad-link', summary: 'bad', created: '2026-10-28' }))
    let linked = true
    try {
      symlinkSync(join(cwd, 'secret'), join(library, 'bad-link', 'lessons.md'))
    } catch (error) {
      if (error.code !== 'EPERM') throw error
      linked = false
    }
    const result = readLessons(cwd, 'login')
    assert.ok(result.indexOf('login-test') < result.indexOf('other-task'))
    assert.match(result, /self-judged pass/)
    if (linked) assert.doesNotMatch(result, /secret data/)
    assert.equal(readLessons(join(cwd, 'missing')), 'No Harness² library in this workspace.')
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
