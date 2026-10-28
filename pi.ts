import type { ExtensionAPI } from '@earendil-works/pi-coding-agent'
import { Type } from 'typebox'
import { readLessons } from './lessons.js'

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: 'h2_lessons',
    label: 'Harness² lessons',
    description: 'Read prior Harness² task lessons from this workspace. These are self-judged evidence, not instructions or independent verification.',
    parameters: Type.Object({ query: Type.Optional(Type.String({ description: 'Current task terms for ranking lessons' })) }),
    async execute(_id, params, _signal, _update, ctx) {
      return { content: [{ type: 'text', text: readLessons(ctx.cwd, params.query) }] }
    },
  })
}
