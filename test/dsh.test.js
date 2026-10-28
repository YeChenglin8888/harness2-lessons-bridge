import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import plugin from '../index.js'

test('DSH adapter registers a workspace-scoped read tool', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'h2-dsh-'))
  try {
    const dir = join(cwd, '.harness2', 'library', 'login-test')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'entry.json'), JSON.stringify({ taskSlug: 'login-test', summary: 'login', created: '2026-10-28' }))
    writeFileSync(join(dir, 'lessons.md'), 'Check login tests')
    let tool
    const ctx = {
      tools: { register: value => { tool = value } },
      workingDirectory: { ensure: async () => cwd },
    }
    plugin.apply(ctx)
    assert.equal(tool.name, 'h2_lessons')
    assert.match(await tool.execute({ query: 'login' }, { agent: {}, signal: new AbortController().signal }), /Check login tests/)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
