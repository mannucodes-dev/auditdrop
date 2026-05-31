/**
 * Translations — static bilingual dictionary for report strings.
 *
 * Supports English ('en') and simplified Hindi ('hi-simple') for
 * non-technical Indian business owners.
 *
 * The `t()` function:
 *  1. Looks up the key in STRINGS for the given language
 *  2. Replaces {variable} placeholders with values from `vars`
 *  3. Falls back to English if the key isn't found in hi-simple
 *  4. Returns the raw key as a last resort
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportLanguage = 'en' | 'hi-simple';

// ---------------------------------------------------------------------------
// String dictionary
// ---------------------------------------------------------------------------

const STRINGS: Record<ReportLanguage, Record<string, string>> = {
  en: {
    // Revenue
    'revenue.headline': 'This website is losing ₹{amount} every month',
    'revenue.subtext': 'Based on industry averages for {category}',

    // Issues
    'issues.title': 'Issues Found',
    'issue.slowLoad': 'Your site takes {lcp} to load on mobile',
    'issue.noClickToCall': 'No tap-to-call button',
    'issue.noHttps': 'Website is not secure (no HTTPS)',
    'issue.noMeta': 'Missing meta description',
    'issue.noAnalytics': 'No visitor tracking installed',
    'issue.noH1': 'No main heading on page',
    'issue.noViewport': 'Website doesn\'t display properly on phones',
    'issue.noContactForm': 'No contact form on website',
    'issue.noStructuredData': 'No business schema for Google',
    'issue.titleTooLong': 'Page title is too long',

    // GBP issues
    'issue.gbpNoHours': 'No business hours listed on Google',
    'issue.gbpLowRating': 'Google rating is below 4 stars',
    'issue.gbpFewReviews': 'Too few Google reviews',
    'issue.gbpNoPhotos': 'No photos on Google Business Profile',

    // CTA
    'cta.title': 'Ready to fix these issues?',
    'cta.button': 'Book a Free Call',
    'cta.whatsapp': 'Chat on WhatsApp',

    // Report labels
    'report.mobileScore': 'Mobile Score',
    'report.desktopScore': 'Desktop Score',
    'report.verdict.critical': 'Needs immediate attention',
    'report.verdict.warning': 'Room for improvement',
    'report.verdict.good': 'Looking good',

    // Language toggle
    'toggle.english': 'English',
    'toggle.hindi': 'हिंदी',

    // Misc
    'report.poweredBy': 'Powered by AuditDrop',
    'report.disclaimer': 'Estimates based on industry averages. Actual results may vary.',
  },

  'hi-simple': {
    // Revenue
    'revenue.headline': 'Yeh website har mahine ₹{amount} ka nuksan kar rahi hai',
    'revenue.subtext': '{category} industry ke average ke hisaab se',

    // Issues
    'issues.title': 'Problems jo mile',
    'issue.slowLoad': 'Aapki website mobile pe {lcp} mein khulti hai',
    'issue.noClickToCall': 'Phone pe tap karke call karne ka button nahi hai',
    'issue.noHttps': 'Website secure nahi hai (HTTPS nahi hai)',
    'issue.noMeta': 'Meta description nahi hai',
    'issue.noAnalytics': 'Visitors ka tracking nahi lagaya hua',
    'issue.noH1': 'Page pe main heading nahi hai',
    'issue.noViewport': 'Website phone pe sahi se nahi dikhti',
    'issue.noContactForm': 'Website pe contact form nahi hai',
    'issue.noStructuredData': 'Google ke liye business schema nahi hai',
    'issue.titleTooLong': 'Page ka title bahut lamba hai',

    // GBP issues
    'issue.gbpNoHours': 'Google pe business hours nahi diye hue',
    'issue.gbpLowRating': 'Google rating 4 star se neeche hai',
    'issue.gbpFewReviews': 'Google pe bahut kam reviews hain',
    'issue.gbpNoPhotos': 'Google Business Profile pe photos nahi hain',

    // CTA
    'cta.title': 'In problems ko fix karna hai?',
    'cta.button': 'Free Call Book Karein',
    'cta.whatsapp': 'WhatsApp pe baat karein',

    // Report labels
    'report.mobileScore': 'Mobile Score',
    'report.desktopScore': 'Desktop Score',
    'report.verdict.critical': 'Turant dhyan dena zaroori hai',
    'report.verdict.warning': 'Behtar ho sakta hai',
    'report.verdict.good': 'Accha dikh raha hai',

    // Language toggle
    'toggle.english': 'English',
    'toggle.hindi': 'हिंदी',

    // Misc
    'report.poweredBy': 'AuditDrop dwara powered',
    'report.disclaimer': 'Industry average pe based estimates. Actual results alag ho sakte hain.',
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Translates a string key into the target language.
 *
 * @param key   – Dot-separated string key (e.g. 'revenue.headline')
 * @param lang  – Target language ('en' or 'hi-simple')
 * @param vars  – Optional record of variable replacements (e.g. { amount: '8,000' })
 * @returns The translated string with variables replaced,
 *   falling back to English, then the raw key.
 */
export function t(
  key: string,
  lang: ReportLanguage,
  vars?: Record<string, string>
): string {
  // Look up in target language first, then fall back to English
  let value = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;

  // Replace {variable} placeholders
  if (vars) {
    for (const [varName, varValue] of Object.entries(vars)) {
      value = value.replace(new RegExp(`\\{${varName}\\}`, 'g'), varValue);
    }
  }

  return value;
}
