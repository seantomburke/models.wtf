import { describe, expect, it } from 'vitest'
import { findNode24, node24Environment, npmCliFor } from './run-node24.mjs'

describe('Node 24 launcher', () => {
  it('uses the current executable when already running on Node 24', () => {
    expect(
      findNode24({
        currentPath: '/runtime/node',
        currentVersion: '24.15.0',
        exists: () => false,
      }),
    ).toBe('/runtime/node')
  })

  it('prefers an explicit Node 24 executable over an installed nvm version', () => {
    expect(
      findNode24({
        currentVersion: '26.5.0',
        environment: { NODE_24_BIN: '/custom/node', NVM_DIR: '/nvm' },
        exists: (path) => path === '/custom/node' || path === '/nvm/versions/node',
        readDir: () => ['v24.15.0'],
      }),
    ).toBe('/custom/node')
  })

  it('chooses the newest installed Node 24 release from nvm', () => {
    const installed = new Set(['/nvm/versions/node', '/nvm/versions/node/v24.15.0/bin/node'])
    expect(
      findNode24({
        currentVersion: '26.5.0',
        environment: { NVM_DIR: '/nvm' },
        exists: (path) => installed.has(path),
        readDir: () => ['v24.5.0', 'v24.15.0'],
      }),
    ).toBe('/nvm/versions/node/v24.15.0/bin/node')
  })

  it('finds npm installed with the selected runtime', () => {
    const node = '/nvm/versions/node/v24.15.0/bin/node'
    expect(npmCliFor(node, () => true)).toBe('/nvm/versions/node/v24.15.0/lib/node_modules/npm/bin/npm-cli.js')
  })

  it('puts the selected Node 24 directory first for npm child scripts', () => {
    expect(node24Environment('/nvm/versions/node/v24.15.0/bin/node', { PATH: '/usr/local/bin' }).PATH).toBe(
      '/nvm/versions/node/v24.15.0/bin:/usr/local/bin',
    )
  })
})
