const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'safari-source');
const PROJECT_DIR = path.join(ROOT, 'safari');
const APP_NAME = 'Stardance Utils Safari';
const APP_PROJECT_ROOT = path.join(PROJECT_DIR, APP_NAME);
const APP_XCODEPROJ = path.join(APP_PROJECT_ROOT, `${APP_NAME}.xcodeproj`);
const APP_BUNDLE_ID = 'com.hridyaagrawal.stardanceutils';
const EXTENSION_BUNDLE_ID = `${APP_BUNDLE_ID}.extension`;
const DEFAULT_MACOS_DEPLOYMENT_TARGET = '14.0';

const SOURCE_FILES = [
  'manifest.json',
  'background.js',
  'content.js',
  'shared.js',
  'themes.js',
  'sidebar.js',
  'ai-check.js',
  'shop.js',
  'projects.js',
  'settings.js',
  'onboarding.js',
  'command-palette.js',
  'openai-verify.js',
  'styles.css',
  'icon32.png',
  'icon64.png',
  'icon128.png'
];

function run(command, args) {
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit'
  });
}

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(relativePath, destinationRoot) {
  const source = path.join(ROOT, relativePath);
  const destination = path.join(destinationRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function patchProject(manifestVersion, buildNumber, deploymentTarget) {
  const projectFile = path.join(APP_XCODEPROJ, 'project.pbxproj');
  let content = fs.readFileSync(projectFile, 'utf8');

  content = content.replace(/PRODUCT_BUNDLE_IDENTIFIER = "?com\.hridyaagrawal\.(?:stardanceutils|Stardance-Utils-Safari)\.[Ee]xtension"?;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${EXTENSION_BUNDLE_ID};`);
  content = content.replace(/PRODUCT_BUNDLE_IDENTIFIER = "?com\.hridyaagrawal\.Stardance-Utils-Safari"?;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${APP_BUNDLE_ID};`);
  content = content.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${manifestVersion};`);
  content = content.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${buildNumber};`);
  content = content.replace(/MACOSX_DEPLOYMENT_TARGET = [^;]+;/g, `MACOSX_DEPLOYMENT_TARGET = ${deploymentTarget};`);

  if (!content.includes('INFOPLIST_KEY_LSApplicationCategoryType')) {
    content = content.replace(
      /INFOPLIST_KEY_CFBundleDisplayName = "Stardance Utils Safari";\n/g,
      'INFOPLIST_KEY_CFBundleDisplayName = "Stardance Utils Safari";\n\t\t\t\tINFOPLIST_KEY_LSApplicationCategoryType = "public.app-category.productivity";\n'
    );
  }

  fs.writeFileSync(projectFile, content);

  const viewControllerFile = path.join(APP_PROJECT_ROOT, APP_NAME, 'ViewController.swift');
  content = fs.readFileSync(viewControllerFile, 'utf8');
  content = content.replace(/let extensionBundleIdentifier = "[^"]+"/, `let extensionBundleIdentifier = "${EXTENSION_BUNDLE_ID}"`);
  fs.writeFileSync(viewControllerFile, content);
}

function main() {
  const manifest = readJson('manifest.json');
  const buildNumber = process.env.SAFARI_BUILD_NUMBER || '1';
  const deploymentTarget = process.env.SAFARI_MACOS_DEPLOYMENT_TARGET || DEFAULT_MACOS_DEPLOYMENT_TARGET;

  resetDir(SOURCE_DIR);
  fs.mkdirSync(path.join(SOURCE_DIR, 'themes'), { recursive: true });

  SOURCE_FILES.forEach((file) => copyFile(file, SOURCE_DIR));

  const themesDir = path.join(ROOT, 'themes');
  fs.readdirSync(themesDir).forEach((fileName) => {
    if (fileName.endsWith('.css')) {
      copyFile(path.join('themes', fileName), SOURCE_DIR);
    }
  });

  resetDir(PROJECT_DIR);
  run('xcrun', [
    'safari-web-extension-converter',
    'safari-source',
    '--project-location',
    'safari',
    '--app-name',
    APP_NAME,
    '--bundle-identifier',
    APP_BUNDLE_ID,
    '--swift',
    '--macos-only',
    '--copy-resources',
    '--no-open',
    '--no-prompt',
    '--force'
  ]);

  patchProject(manifest.version, buildNumber, deploymentTarget);

  console.log(`Prepared Safari project at ${path.relative(ROOT, APP_PROJECT_ROOT)} (${manifest.version} build ${buildNumber}, macOS ${deploymentTarget}+)`);
}

main();
