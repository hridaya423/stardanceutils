const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REQUIRED_STARDANCE_SCRIPTS = [
  'shared.js',
  'themes.js',
  'sidebar.js',
  'ai-check.js',
  'shop.js',
  'projects.js',
  'settings.js',
  'onboarding.js',
  'command-palette.js',
  'content.js'
];

function fail(message) {
  throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function assertFileExists(baseDir, relativePath, context) {
  if (!fs.existsSync(path.join(ROOT, baseDir, relativePath))) {
    fail(`${context} references missing file: ${path.join(baseDir, relativePath)}`);
  }
}

function getContentScriptsForMatch(manifest, matchPrefix) {
  return (manifest.content_scripts || []).filter((entry) => (
    Array.isArray(entry.matches) && entry.matches.some((pattern) => pattern.startsWith(matchPrefix))
  ));
}

function validateManifest(manifestPath, baseDir = '.') {
  const manifest = readJson(path.join(baseDir, manifestPath));
  const context = path.join(baseDir, manifestPath);

  (manifest.content_scripts || []).forEach((entry) => {
    [...(entry.js || []), ...(entry.css || [])].forEach((assetPath) => {
      assertFileExists(baseDir, assetPath, context);
    });
  });

  const backgroundScripts = manifest.background?.service_worker
    ? [manifest.background.service_worker]
    : (manifest.background?.scripts || []);
  backgroundScripts.forEach((scriptPath) => assertFileExists(baseDir, scriptPath, context));

  const stardanceEntries = getContentScriptsForMatch(manifest, 'https://stardance.hackclub.com/');
  if (!stardanceEntries.length) {
    fail(`${context} has no Stardance content script entry`);
  }

  const loadedScripts = stardanceEntries.flatMap((entry) => entry.js || []);
  REQUIRED_STARDANCE_SCRIPTS.forEach((scriptPath) => {
    if (!loadedScripts.includes(scriptPath)) {
      fail(`${context} does not load required Stardance script: ${scriptPath}`);
    }
  });

  return manifest;
}

function main() {
  const chromeManifest = validateManifest('manifest.json');
  const firefoxManifest = validateManifest('manifest_firefox.json');

  if (chromeManifest.version !== firefoxManifest.version) {
    fail(`Manifest version mismatch: manifest.json=${chromeManifest.version} manifest_firefox.json=${firefoxManifest.version}`);
  }

  if (process.env.VALIDATE_SAFARI_SOURCE === 'true' && fs.existsSync(path.join(ROOT, 'safari-source', 'manifest.json'))) {
    validateManifest('manifest.json', 'safari-source');
  }

  console.log('Extension package validation passed');
}

main();
