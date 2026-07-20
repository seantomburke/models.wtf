# PostHog audit report: post-remediation

## Summary

The two actionable event-contract findings from the initial audit are resolved. Event helper names now come from static maps, and bookmark changes emit `compare_bookmark_toggled` with the model ID and the action taken. Browser events still use PostHog's public ingest host, and the installed JavaScript SDK remains one patch behind the audited latest version.

This report describes the source tree after remediation. It does not claim that proxy infrastructure changed.

**Counts**

- **Errors**: 0
- **Warnings**: 1
- **Suggestions**: 1
- **Passes**: 9

| Severity | Area | Check | File | Details |
|----------|------|-------|------|---------|
| `pass` | Event Capture | Static event names | `src/lib/posthog.ts:8` | The four finite helper families use explicit typed maps and preserve their existing emitted names. |
| `pass` | Event Capture | Growth events | `src/pages/Compare.tsx:142` | Bookmark add/remove emits `compare_bookmark_toggled` with `model_id` and `action` set to `add` or `remove`. |
| `warning` | Event Capture | First-party proxy | `src/lib/analytics.ts:87` | Production sends browser events to the configured PostHog ingest host without a first-party proxy, so tracking blockers can drop them. |
| `suggestion` | Installation | SDK version | `package.json:22` | `posthog-js` 1.404.0 is one patch behind the audited 1.404.1 release. |

## Remaining actions

1. **First-party proxy** — Configure proxy infrastructure before changing `VITE_POSTHOG_HOST` at `src/lib/analytics.ts:88`. GitHub Pages cannot provide an origin proxy by itself. See [PostHog proxy guidance](https://posthog.com/docs/advanced/proxy).
2. **SDK patch version** — Update `posthog-js` from 1.404.0 to 1.404.1 in `package.json:22`. See [posthog-js releases](https://github.com/PostHog/posthog-js/releases).

## Resolved findings

### Static event names

`src/lib/posthog.ts:8-30` defines typed maps for model, quiz, calculator, and graph interactions. The public helper signatures and emitted names are unchanged, and focused tests cover every action-to-event mapping.

### Bookmark telemetry

`src/lib/posthog-events.ts:17` defines the static `compare_bookmark_toggled` event. `src/lib/posthog-events.ts:182-190` captures the typed `model_id` and `action` properties, while `src/pages/Compare.tsx:142-147` derives the action from the pre-toggle state before saving the updated bookmark set. Integration coverage exercises add/remove behavior in both table and card views.

## Full audit

### Installation

| Check | Status | File | Details |
|-------|--------|------|---------|
| SDK installed | pass | `package.json:19` | `@posthog/react` 1.10.3 and `posthog-js` 1.404.0 are installed. |
| SDK up to date | suggestion | `package.json:22` | Installed 1.404.0; the audited latest patch is 1.404.1. |
| Init correct | pass | `src/lib/analytics.ts:76` | Token and host come from Vite environment variables; SSR exits before importing the browser SDK. |
| Init not duplicated | pass | `src/lib/analytics.ts:85` | One browser initialization is guarded by a shared load promise. |

Static inspection cannot prove that production environment variables are populated at deploy time. Verify live events after deployment.

### Identification

| Check | Status | File | Details |
|-------|--------|------|---------|
| Stable distinct ID | pass | `src/lib/analytics.ts:22` | Not applicable: the site is anonymous and has no identify flow. |
| Identify before capture | pass | `src/main.tsx:15` | Not applicable: no authenticated identity or identity-dependent flags exist. |
| Cross-runtime distinct ID | pass | `src/entry-server.tsx:1` | Only the browser runtime initializes PostHog. |
| Reset on logout | pass | `src/App.tsx:99` | Not applicable: no login, logout, or account-switch flow exists. |

If accounts are added later, add identify-on-session-start and reset-on-logout together.

### Event capture

| Check | Status | File | Details |
|-------|--------|------|---------|
| Static event names | pass | `src/lib/posthog.ts:8` | All finite helper families use explicit event-name maps. |
| First-party proxy | warning | `src/lib/analytics.ts:87` | No first-party ingest proxy is configured. |
| Growth events | pass | `src/pages/Compare.tsx:142` | Bookmark add/remove emits `compare_bookmark_toggled`; quiz, compare, calculator, and Learn actions remain tracked. |

This source audit does not quantify event loss from tracking blockers or prove that bookmarks predict retention. Check event volume and retention correlation in PostHog after deployment.

## About this report

This is a post-remediation source review of the original audit ledger. The proxy warning and SDK patch suggestion remain open; the static-name error and missing bookmark-event warning are resolved.
