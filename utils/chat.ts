import natural from "natural";
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const allowed = [
  "complaint",
  "submit complaint",
  "submit issue",
  "make complaint",
  "report problem",
  "track complaint",
  "check complaint status",
  "status update",
  "resolve issue",
  "resolve complaint",
  "fix problem",
  "escalate complaint",
  "escalate issue",
  "ai",
  "ai assistant",
  "system help",
  "about the system",
  "aicms",
  "eeu",
  "electric utility",
  "upload file",
  "upload document",
  "attach file",
  "send document",
  "file not uploading",
  "login",
  "log in",
  "sign in",
  "register",
  "sign up",
  "create account",
  "open account",
  "password",
  "change password",
  "forgot password",
  "reset password",
  "user role",
  "admin",
  "general manager",
  "profile",
  "update profile",
  "edit profile",
  "account",
  "account settings",
  "my account",
  "dashboard",
  "complaint history",
  "view complaints",
  "track my issue",
  "resolve my case",
].map(stemmer.stem);

const greetings = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "how are you",
  "hey there",
  "hi there",
  "what's up",
  "greetings",
  "salutations",
  "okay",
  "k",
  "bye",
  "buddy",
  "chaw",
  "tnxs",
  "tnx",
  "whats up",
  "wassup",
  "wassap",
  "what's up",
  "see you there",
  "see you later",
  "see you tommorow",
  "i will hit you later",
  "I will ask you later",
  "yo",
  "sup",
  "thank you",
  "thanks",
  "thanks a lot",
  "appreciate it",
  "much appreciated",
  "thank you so much",
  "cheers",
  "great job",
  "well done",
  "good work",
  "awesome",
  "you are helpful",
  "that helps",
];
const SYSTEM_PROMPT = `
  You are a helpful assistant for the EEU AI-Assisted Complaint Management System (AICMS).
  Only answer questions related to complaint submission, tracking, escalation, resolution, file uploads, login, registration, user roles, and system features.
  Greet users politely if they say "Hi", "Hello", "Good morning", etc.
  If asked anything outside these topics, respond with:
  "I'm here to assist only with EEU Complaint Management System-related queries."
  `;

const isRelevant = (message: string): boolean => {
  const lower = message.toLowerCase();

  if (greetings.some((g) => lower.includes(g))) return true;
  const tokens = tokenizer.tokenize(lower).map(stemmer.stem);
  return tokens.some((token) => allowed.includes(token));
};

export { SYSTEM_PROMPT, isRelevant };
