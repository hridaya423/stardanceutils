# Stardance Utils

A utility extension for Stardance.

## Features

- Appearance and navigation:
  - Curated sidebar font pairings.
  - Custom font pairings with Google Fonts autocomplete.
  - Sidebar tab reordering with drag and drop.
  - Try mode preview panel for cycling through font pairings before saving.
  - Built-in themes: Kanagawa, Nord, Tokyo Night, and Catppuccin variants.
- Project page improvements:
  - Hero-level Ship button placement.
  - Inline devlog composer on project pages.
  - Inline devlog editing.
- Profile page improvements:
  - Pin projects from the Projects tab.
- Devlog writing tools:
  - Drafts for devlogs.
  - Native browser speech-to-text.
  - Basic transcript cleanup for capitalization and punctuation.
  - Slack emoji autocomplete and picker integration. (Functional when devlog images PR is merged)
  - Markdown toolbar with live preview.
- Feed AI checks:
  - Adds a `Check AI` action to feed cards.
  - Sends image checks through OpenAI Verify.
  - Gemini check to be added.

## Installation

### Chrome

**Chrome Web Store:**
1. Visit the [Chrome Web Store](https://chromewebstore.google.com/detail/stardance-utils/kapdpeddcghffhildgnbbdnaedeebdoj)
2. Click "Add to Chrome"
3. Confirm the installation

**Load Unpacked:**
1. Download the extension files from releases
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### Firefox

**Mozilla Addons:**
1. Visit [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/stardance-utils/)
2. Click "Add to Firefox"
3. Confirm the installation

**Load Temporarily:**
1. Download the firefox.zip from releases
2. Unzip the folder
3. Open Firefox and go to `about:debugging`
4. Click "This Firefox"
5. Click "Load Temporary Add-on"
6. Select the `manifest.json` from the firefox release

## Development Notes

- Main Stardance content script is split across:
  - `shared.js`
  - `themes.js`
  - `sidebar.js`
  - `ai-check.js`
  - `projects.js`
  - `settings.js`
  - `content.js`
- OpenAI Verify automation lives in:
  - `background.js`
  - `openai-verify.js`
