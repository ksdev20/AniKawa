const URL_REGEX =
  /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|io|xyz|ru|cn|tk|ml|ga|cf|click|top|shop))/gi;

const REPEATED_CHAR_REGEX = /(.)\1{7,}/;

const MULTIPLE_EMOJI_REGEX = /([\u{1F300}-\u{1FAFF}]){8,}/u;

const EXCESSIVE_WHITESPACE_REGEX = /\s{8,}/;

const SUSPICIOUS_WORDS = [
  "free money",
  "click here",
  "telegram",
  "whatsapp",
  "crypto",
  "bitcoin",
  "casino",
  "loan",
  "sex",
  "porn",
  "viagra",
  "hack",
  "hacked",
  "airdrop",
  "earn money",
  "discount",
  "buy now",
];

export interface SpamScoreInput {
  content: string;

  guestName?: string | null;

  email?: string | null;
}

/**
 * Calculates a spam risk score.
 *
 * 0 = clean
 * 100 = obvious spam
 */
export function calculateSpamScore({
  content,
  guestName,
  email,
}: SpamScoreInput): number {
  let score = 0;

  const text = content.trim();

  const lower = text.toLowerCase();

  //
  // Length
  //

  if (text.length < 3) {
    score += 20;
  }

  //
  // Links
  //

  const links = text.match(URL_REGEX)?.length ?? 0;

  score += links * 20;

  //
  // Suspicious keywords
  //

  for (const word of SUSPICIOUS_WORDS) {
    if (lower.includes(word)) {
      score += 15;
    }
  }

  //
  // Repeated characters
  //

  if (REPEATED_CHAR_REGEX.test(text)) {
    score += 15;
  }

  //
  // Excessive whitespace
  //

  if (EXCESSIVE_WHITESPACE_REGEX.test(text)) {
    score += 5;
  }

  //
  // Emoji spam
  //

  if (MULTIPLE_EMOJI_REGEX.test(text)) {
    score += 10;
  }

  //
  // ALL CAPS
  //

  const letters = text.replace(/[^a-z]/gi, "");

  if (letters.length >= 10 && letters === letters.toUpperCase()) {
    score += 10;
  }

  //
  // Very long comments
  //

  if (text.length > 1500) {
    score += 10;
  }

  //
  // Guest name quality
  //

  if (guestName) {
    const normalized = guestName.trim().toLowerCase();

    if (
      normalized === "admin" ||
      normalized === "moderator" ||
      normalized === "support"
    ) {
      score += 30;
    }

    if (normalized.length < 2) {
      score += 10;
    }
  }

  //
  // Disposable email hint
  //

  if (email) {
    const lowerEmail = email.toLowerCase();

    if (
      lowerEmail.endsWith("@tempmail.com") ||
      lowerEmail.endsWith("@mailinator.com") ||
      lowerEmail.endsWith("@10minutemail.com")
    ) {
      score += 25;
    }
  }

  return Math.min(score, 100);
}
