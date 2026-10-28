import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import piExtension from '../pi.ts'

test('Pi adapter registers the same workspace-scoped read tool', async () => {
  const cwd = mkdtempSync(join(tmpdir(), 'h2-pi-'))
  try {
    const dir = join(cwd, '.harness2', 'library', 'login-test')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'entry.json'), JSON.stringify({ taskSlug: 'login-test', summary: 'login', created: '2026-10-28' }))
    writeFileSync(join(dir, 'lessons.md'), 'Check login tests')
    let tool: { name: string; execute: (...args: unknown[]) => Promise<{ content: Array<{ text: string }> }> } | undefined
    piExtension({ registerTool: value => { tool = value } } as Parameters<typeof piExtension>[0])
    assert.equal(tool?.name, 'h2_lessons')
    const result = await tool!.execute('', { query: 'login' }, undefined, undefined, { cwd })
    assert.match(result.content[0]!.text, /Check login tests/)
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
