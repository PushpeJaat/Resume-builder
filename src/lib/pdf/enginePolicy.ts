const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

function parseBooleanEnv(raw: string | undefined, defaultValue: boolean): boolean {
  if (!raw) {
    return defaultValue;
  }

  const normalized = raw.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return defaultValue;
}

export function shouldForceBrowserlessPdf(): boolean {
  const primary = process.env.RESUME_PDF_FORCE_BROWSERLESS;
  const legacy = process.env.PDF_FORCE_BROWSERLESS;
  return parseBooleanEnv(primary ?? legacy, false);
}

export function shouldAllowBrowserlessFallback(): boolean {
  const primary = process.env.RESUME_PDF_ALLOW_BROWSERLESS_FALLBACK;
  const legacy = process.env.PDF_LAYOUT_BROWSERLESS_FALLBACK;
  return parseBooleanEnv(primary ?? legacy, true);
}
