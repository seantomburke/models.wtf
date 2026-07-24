# Issue #144: Node 24 Bundle Budget Plan

> **Status:** Complete

## Problem

The entry budget is 140 kB gzip while the current Node 24 build measures 139.4
kB.
The deploy workflow builds with Node 24, whereas a developer can otherwise
measure a slightly different gzip result with another Node release.

## Plan

1. Add a lightweight Node-only launcher that runs a command with an installed
   Node 24 runtime and fails with installation guidance when none is available.
2. Expose the launcher as a package script, add a Node version file, and make
   CI call the explicit Node 24 budget check after the build.
3. Calibrate the entry ceiling to 145 kB gzip. This retains a 5.6 kB margin at
   the measured Node 24 baseline while still catching a meaningful shared
   dependency or data regression.
4. Add focused tests for runtime selection and the budget check's output, then
   run the full Node 24 CI-equivalent command set and standard project checks.

## Success criteria

- `npm run build:node24` builds and checks the bundle with Node 24.
- CI visibly invokes the Node 24 budget verification.
- The entry budget has several kB of measured headroom and the rationale is
  recorded beside the ceiling.
- The checks pass before the change is committed and pushed to `main`.
