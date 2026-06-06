import type { Icon } from "@phosphor-icons/react";
import {
  Palette,
  NotePencil,
  TextAa,
  ShoppingBag,
  MarkdownLogo,
  Sparkle,
  DotsSixVertical,
  Microphone,
  FloppyDisk,
  PushPin,
  Smiley,
  RocketLaunch,
} from "@phosphor-icons/react/dist/ssr";

export const FEATURE_ICONS: Record<string, Icon> = {
  "theme-engine": Palette,
  "devlog-composer": NotePencil,
  typography: TextAa,
  "shop-goals": ShoppingBag,
  markdown: MarkdownLogo,
  "ai-check": Sparkle,
  "sidebar-reorder": DotsSixVertical,
  "speech-to-text": Microphone,
  drafts: FloppyDisk,
  "pin-projects": PushPin,
  "slack-emoji": Smiley,
  "ship-button": RocketLaunch,
};
