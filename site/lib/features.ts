export type Feature = {
  id: string;
  title: string;
  metric: string;
  short: string;
  long: string;
  tier: "primary" | "more";
  image?: string;
};

export const FEATURES: Feature[] = [
  {
    id: "theme-engine",
    title: "Theme Engine",
    metric: "7 themes",
    short: "Seven themes that update settings, rails, overlays, and panels together.",
    long:
      "Seven themes, including Kanagawa, Nord, Tokyo Night, and Catppuccin variants. The whole interface updates together instead of leaving half the site unchanged.",
    tier: "primary",
    image: "/featurepics/theme.png",
  },
  {
    id: "devlog-composer",
    title: "Inline devlogging",
    metric: "Inline posting",
    short: "Write, post, and edit devlogs without leaving the project page.",
    long:
      "The editor stays on the project page, the post action is always nearby, and edits happen in place instead of inside a separate screen.",
    tier: "primary",
    image: "/featurepics/betterprojectpage.png",
  },
  {
    id: "typography",
    title: "Typography Control",
    metric: "11 pairings",
    short: "Switch between built-in pairings or search Google Fonts directly.",
    long:
      "Use eleven built-in pairings or search Google Fonts directly. Try mode lets you preview options before you save one.",
    tier: "primary",
  },
  {
    id: "shop-goals",
    title: "Shop Goals",
    metric: "Wishlist → Goals",
    short: "Wishlisted items turn into trackable goals with price and progress.",
    long:
      "Wishlisted items become goals with price, quantity, and progress tracking. The catalog is easier to sort, and the New shelf still stays where it belongs.",
    tier: "primary",
    image: "/featurepics/goals.png",
  },
  {
    id: "markdown",
    title: "Markdown Preview",
    metric: "Live preview",
    short: "Write with preview, toolbar actions, code blocks, and formatting tools.",
    long:
      "Write with live preview, toolbar actions, images, code blocks, and formatting without losing the editor while you work.",
    tier: "primary",
  },
  {
    id: "ai-check",
    title: "AI Provenance",
    metric: "OpenAI Verify",
    short: "Adds a Check AI action to feed cards through OpenAI Verify.",
    long:
      "Feed cards get a Check AI action that sends image bytes through OpenAI Verify. Jobs run in the background and return generated, no signal, or failed.",
    tier: "more",
  },
  {
    id: "sidebar-reorder",
    title: "Sidebar Reordering",
    metric: "Drag & drop",
    short: "Reorder sidebar tabs with drag and drop.",
    long: "Reorder sidebar tabs with drag and drop so the parts you use most are easier to reach.",
    tier: "more",
  },
  {
    id: "speech-to-text",
    title: "Speech to Text",
    metric: "Native STT",
    short: "Dictate devlogs with the browser's built-in speech-to-text.",
    long:
      "Dictate devlogs with the browser's speech recognition, then clean up punctuation and capitalization before posting.",
    tier: "more",
  },
  {
    id: "drafts",
    title: "Devlog Drafts",
    metric: "Autosave",
    short: "Keeps unfinished devlogs around so you can come back later.",
    long: "Keeps unfinished devlogs saved so you can leave, come back, and keep writing where you stopped.",
    tier: "more",
  },
  {
    id: "pin-projects",
    title: "Pin Projects",
    metric: "Profile",
    short: "Pin projects straight from the Projects tab.",
    long: "Pin projects from the Projects tab so the work you care about most shows up first on your profile.",
    tier: "more",
  },
  {
    id: "slack-emoji",
    title: "Slack Emoji",
    metric: "Autocomplete",
    short: "Adds Slack emoji autocomplete and a picker to the composer.",
    long: "Adds Slack emoji autocomplete and a picker directly to the devlog composer.",
    tier: "more",
  },
];

export const PRIMARY_FEATURES = FEATURES.filter((f) => f.tier === "primary");
export const MORE_FEATURES = FEATURES.filter((f) => f.tier === "more");
export const HOME_SCROLL_FEATURES = [FEATURES[0], FEATURES[1], FEATURES[3]];
export const HOME_BENTO_FEATURES = [FEATURES[2], FEATURES[4], ...MORE_FEATURES];
