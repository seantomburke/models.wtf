/**
 * Run an npm command with Node 24, the same major version used in CI.
 *
 * Build artifacts can differ slightly between Node releases because the build
 * uses Node's gzip implementation. Keeping this launcher dependency-free lets
 * contributors reproduce the CI bundle check without adding a runtime manager
 * to the production dependency graph.
 */
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const NODE_MAJOR = 24

export function findNode24({
  currentPath = process.execPath,
  currentVersion = process.versions.node,
  environment = process.env,
  home = homedir(),
  exists = existsSync,
  readDir = readdirSync,
} = {}) {
  if (Number(currentVersion.split('.')[0]) === NODE_MAJOR) return currentPath

  const configured = environment.NODE_24_BIN
  if (configured && exists(configured)) return configured

  const nvmDir = environment.NVM_DIR || join(home, '.nvm')
  const versionsDir = join(nvmDir, 'versions', 'node')
  if (!exists(versionsDir)) return undefined

  const versions = readDir(versionsDir)
    .filter((version) => /^v24\.\d+\.\d+$/.test(version))
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))

  return versions.map((version) => join(versionsDir, version, 'bin', 'node')).find(exists)
}

export function npmCliFor(nodePath, exists = existsSync) {
  const npmCli = resolve(dirname(nodePath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')
  return exists(npmCli) ? npmCli : undefined
}

export function node24Environment(nodePath, environment = process.env) {
  return { ...environment, PATH: `${dirname(nodePath)}${delimiter}${environment.PATH || ''}` }
}

function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    throw new Error('usage: node scripts/run-node24.mjs <npm arguments>')
  }

  const node24 = findNode24()
  if (!node24) {
    throw new Error(
      'Node 24 is required. Install it with `nvm install` (the project .nvmrc specifies 24), ' +
        'or set NODE_24_BIN to its node executable.',
    )
  }

  const npmCli = npmCliFor(node24)
  if (!npmCli) {
    throw new Error(`npm was not found next to Node 24 at ${node24}`)
  }

  console.log(`Running npm ${args.join(' ')} with Node ${node24}`)
  // npm scripts use `#!/usr/bin/env node`, so put this runtime first in PATH
  // as well as using it for npm itself. Otherwise a parent Node 26 PATH can
  // silently run the build and its gzip check under the wrong release.
  const result = spawnSync(node24, [npmCli, ...args], {
    env: node24Environment(node24),
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
