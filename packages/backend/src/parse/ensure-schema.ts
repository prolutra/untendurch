/**
 * Idempotent schema migrations, run once on server start.
 *
 * Clients must not add fields themselves (Bridge CLP: addField requires
 * authentication), so new fields written by the public report form have to
 * be added here with the master key.
 */
export async function ensureSchema(): Promise<void> {
  const bridgeSchema = new Parse.Schema('Bridge');

  let fields: Record<string, unknown>;
  try {
    const existing = await bridgeSchema.get();
    fields = existing.fields ?? {};
  } catch {
    console.warn('[ensureSchema] Bridge class not found, skipping');
    return;
  }

  if (!('isInaccessibleForHumans' in fields)) {
    // No default: bridges reported before this field existed stay "unknown"
    bridgeSchema.addBoolean('isInaccessibleForHumans', { required: false });
    await bridgeSchema.update();
    console.log('[ensureSchema] Added Bridge.isInaccessibleForHumans');
  }
}
