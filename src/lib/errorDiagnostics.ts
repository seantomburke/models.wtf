/**
 * Sanitizers for crash telemetry.
 *
 * The error boundary used to report only an error's `name` and whether a
 * component stack existed. That is enough to know a crash happened and nothing
 * else: a real `TypeError` on /graph (2026-07-24) arrived with no message, no
 * stack, and no way to reproduce it.
 *
 * Sending the raw values instead is not an option. Analytics runs with
 * `mask_all_text` and `mask_personal_data_properties` (see src/lib/analytics.ts)
 * because this site must never turn what a visitor typed into event data, and
 * error messages happily quote it: a throw from the calculator or the search box
 * can carry the user's own input inside the message string. These helpers keep
 * the parts that identify a bug and drop the parts that identify a person.
 */

/** Longest message we send. Real messages are short; runaway ones are quoted data. */
const MAX_MESSAGE_LENGTH = 300

/** Stack frames worth keeping. The top frames locate the bug; the rest is React internals. */
const MAX_STACK_FRAMES = 20

/** Component stack frames worth keeping, same reasoning. */
const MAX_COMPONENT_STACK_FRAMES = 20

/**
 * Anything that looks like it came from a person rather than from the code.
 *
 * Quoted spans are the main carrier: `JSON.parse` and friends echo their input
 * back inside quotes. URL query and hash fragments are the other one, since a
 * stack frame's file URL is safe but `?q=<what they searched>` is not.
 */
const QUOTED_SPAN = /(['"`])(?:\\.|(?!\1)[^\\])*\1/g
const URL_QUERY_OR_HASH = /([?#])[^\s)'"]*/g

/** Replace user-supplied spans with a marker that keeps the message readable. */
const stripEmbeddedValues = (text: string): string =>
  text.replace(QUOTED_SPAN, '<redacted>').replace(URL_QUERY_OR_HASH, '$1<redacted>')

/**
 * A crash message with embedded values removed and length capped.
 * Returns undefined when nothing diagnostic survives, so the property is omitted
 * rather than sent as an empty string.
 */
export const sanitizeErrorMessage = (message: unknown): string | undefined => {
  if (typeof message !== 'string') return undefined

  const stripped = stripEmbeddedValues(message).trim()
  if (!stripped) return undefined

  return stripped.length > MAX_MESSAGE_LENGTH
    ? `${stripped.slice(0, MAX_MESSAGE_LENGTH)}...`
    : stripped
}

/**
 * The top frames of a stack, with query strings and quoted values removed.
 *
 * The first line of a `stack` is the message repeated, so it gets the same
 * treatment as the message itself rather than being trusted as a frame.
 */
export const sanitizeErrorStack = (stack: unknown): string | undefined => {
  if (typeof stack !== 'string') return undefined

  const frames = stack
    .split('\n')
    .map((line) => stripEmbeddedValues(line).trim())
    .filter(Boolean)
    .slice(0, MAX_STACK_FRAMES)

  return frames.length ? frames.join('\n') : undefined
}

/**
 * React's component stack, trimmed to the frames nearest the throw.
 *
 * This is the most useful field of the three: it names the component that broke
 * even when the minified stack does not.
 */
export const sanitizeComponentStack = (componentStack: unknown): string | undefined => {
  if (typeof componentStack !== 'string') return undefined

  const frames = componentStack
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPONENT_STACK_FRAMES)

  return frames.length ? frames.join('\n') : undefined
}

/**
 * The route a crash happened on, without query or hash.
 *
 * PostHog already records `$current_url`, but that arrives with the search
 * string attached and the site puts state there (`?q=`, `?sort=`, `?preset=`).
 * A bare pathname groups crashes by page and carries nothing a visitor typed.
 */
export const currentRoute = (): string | undefined => {
  if (typeof window === 'undefined') return undefined

  return window.location.pathname
}
