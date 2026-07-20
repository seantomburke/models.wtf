import { access, readFile } from 'node:fs/promises'

const requiredAdapters = {
  'CLAUDE.md': 'AGENTS.md',
  'GEMINI.md': 'AGENTS.md',
  '.cursor/rules/project.mdc': 'AGENTS.md',
  '.github/copilot-instructions.md': 'AGENTS.md',
  '.claude/agents/copywriter.md': '.agents/agents/copywriter.md',
  '.codex/agents/copywriter.toml': '.agents/agents/copywriter.md',
}

const guidanceFiles = ['AGENTS.md', 'src/AGENTS.md']
const failures = []

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

for (const [adapter, canonicalSource] of Object.entries(requiredAdapters)) {
  if (!(await exists(adapter))) {
    failures.push(`Missing adapter: ${adapter}`)
    continue
  }

  const content = await readFile(adapter, 'utf8')
  if (!content.includes(canonicalSource)) {
    failures.push(`${adapter} must reference ${canonicalSource}`)
  }
}

for (const guidanceFile of guidanceFiles) {
  const content = await readFile(guidanceFile, 'utf8')
  const skillReferences = content.matchAll(/\.agents\/skills\/([\w-]+)(?:\/SKILL\.md)?/g)

  for (const [, skillName] of skillReferences) {
    const skillFile = `.agents/skills/${skillName}/SKILL.md`
    if (!(await exists(skillFile))) {
      failures.push(`${guidanceFile} references missing skill: ${skillFile}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Agent configuration validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Agent configuration is internally consistent.')
}
