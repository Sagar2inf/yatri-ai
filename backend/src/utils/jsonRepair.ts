/**
 * Attempts to extract and repair a JSON object from potentially malformed LLM output.
 * Handles: preamble text, trailing commas, undefined values, truncated output.
 */
export function extractAndRepairJSON(raw: string): string {
  let s = raw.trim();

  // Strip markdown fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Find outermost JSON object boundaries
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end < start) {
    throw new Error('No JSON object found in LLM response');
  }
  s = s.slice(start, end + 1);

  // Fix trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // Fix undefined -> null
  s = s.replace(/:\s*undefined\b/g, ': null');

  // Fix NaN -> null
  s = s.replace(/:\s*NaN\b/g, ': null');

  // Fix unquoted true/false/null that got corrupted to capitalized
  s = s.replace(/:\s*True\b/g, ': true');
  s = s.replace(/:\s*False\b/g, ': false');
  s = s.replace(/:\s*None\b/g, ': null');
  s = s.replace(/:\s*Null\b/g, ': null');

  // Try to parse; if it fails, attempt more aggressive repair
  try {
    JSON.parse(s);
    return s;
  } catch {
    // Aggressive: truncate at last complete field
    const lastCommaOrBrace = Math.max(s.lastIndexOf(',"'), s.lastIndexOf('}'));
    if (lastCommaOrBrace > 100) {
      const trimmed = s.slice(0, lastCommaOrBrace);
      // Count unclosed braces/brackets and close them
      let openBraces = 0;
      let openBrackets = 0;
      for (const ch of trimmed) {
        if (ch === '{') openBraces++;
        else if (ch === '}') openBraces--;
        else if (ch === '[') openBrackets++;
        else if (ch === ']') openBrackets--;
      }
      let closed = trimmed;
      // Close any open arrays before closing objects
      for (let i = 0; i < openBrackets; i++) closed += ']';
      for (let i = 0; i < openBraces; i++) closed += '}';
      try {
        JSON.parse(closed);
        return closed;
      } catch {
        // give up, return what we have
      }
    }
    return s;
  }
}
