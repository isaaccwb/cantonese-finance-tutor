/**
 * Extract JSON from Claude's response text.
 * Handles cases where Claude wraps JSON in markdown code fences.
 */
export function extractJsonFromResponse(text: string): string {
  // Try to find JSON within code fences first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try to find raw JSON (starts with { or [)
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Return as-is and let JSON.parse handle the error
  return text.trim();
}

/**
 * Attempt to repair truncated JSON (e.g. from max_tokens cutoff).
 * Finds the last complete object in the terms array and closes the structure.
 */
export function repairTruncatedJson(json: string): string {
  // Find the last complete object (ends with })
  const lastCompleteObj = json.lastIndexOf("}");
  if (lastCompleteObj === -1) throw new Error("無法修復截斷嘅 JSON");

  let repaired = json.slice(0, lastCompleteObj + 1);

  // Count open brackets to determine what needs closing
  const openBraces =
    (repaired.match(/{/g) || []).length -
    (repaired.match(/}/g) || []).length;
  const openBrackets =
    (repaired.match(/\[/g) || []).length -
    (repaired.match(/\]/g) || []).length;

  // Close any open arrays then objects
  for (let i = 0; i < openBrackets; i++) repaired += "]";
  for (let i = 0; i < openBraces; i++) repaired += "}";

  return repaired;
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
