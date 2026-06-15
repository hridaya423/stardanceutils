const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const DEFAULT_AMO_BASE_URL = 'https://addons.mozilla.org/api/v5';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonFromGit(ref, relativePath) {
  return JSON.parse(git(['show', `${ref}:${relativePath}`]));
}

function fileExists(filePath) {
  return fs.existsSync(path.resolve(ROOT, filePath));
}

function compareVersions(left, right) {
  const leftParts = String(left).split('.').map(Number);
  const rightParts = String(right).split('.').map(Number);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] || 0;
    const rightPart = rightParts[index] || 0;
    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

function validateManifestVersion(version) {
  const parts = String(version).split('.');
  if (parts.length < 3 || parts.some((part) => !/^\d+$/.test(part))) {
    throw new Error(`Unsupported version format: ${version}. Expected dotted numeric semver like 0.0.7`);
  }
}

function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function appendSummary(lines) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const content = Array.isArray(lines) ? lines.join('\n') : String(lines);
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${content}\n`);
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const details = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : String(payload);
    throw new Error(`Request failed (${response.status} ${response.statusText}) for ${url}\n${details}`);
  }

  return payload;
}

function getManifestVersions() {
  const chromeManifest = readJson('manifest.json');
  const firefoxManifest = readJson('manifest_firefox.json');

  if (chromeManifest.version !== firefoxManifest.version) {
    throw new Error(
      `Manifest version mismatch: manifest.json=${chromeManifest.version} manifest_firefox.json=${firefoxManifest.version}`
    );
  }

  return {
    version: chromeManifest.version,
    chromeManifest,
    firefoxManifest
  };
}

function getManifestVersionsFromGit(ref) {
  const chromeManifest = readJsonFromGit(ref, 'manifest.json');
  const firefoxManifest = readJsonFromGit(ref, 'manifest_firefox.json');

  if (chromeManifest.version !== firefoxManifest.version) {
    throw new Error(
      `Manifest version mismatch at ${ref}: manifest.json=${chromeManifest.version} manifest_firefox.json=${firefoxManifest.version}`
    );
  }

  return {
    version: chromeManifest.version,
    chromeManifest,
    firefoxManifest
  };
}

function getExpectedPublishVersion() {
  const configuredVersion = getEnv('PUBLISH_VERSION');

  if (configuredVersion) {
    validateManifestVersion(configuredVersion);
    return configuredVersion;
  }

  const { version } = getManifestVersions();
  validateManifestVersion(version);
  return version;
}

function stampManifestVersion(filePath, version) {
  const absolutePath = path.resolve(ROOT, filePath);
  const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  manifest.version = version;
  fs.writeFileSync(absolutePath, `${JSON.stringify(manifest, null, 4)}\n`);
}

function git(args) {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8'
  }).trim();
}

function getChromePublishedVersion(statusPayload) {
  return statusPayload?.publishedItemRevisionStatus?.distributionChannels?.[0]?.crxVersion || '';
}

function getChromeSubmittedVersion(statusPayload) {
  return statusPayload?.submittedItemRevisionStatus?.distributionChannels?.[0]?.crxVersion || '';
}

async function fetchChromeStatus() {
  const token = requireEnv('CHROME_ACCESS_TOKEN');
  const publisherId = requireEnv('CHROME_PUBLISHER_ID');
  const extensionId = requireEnv('CHROME_EXTENSION_ID');
  const url = `https://chromewebstore.googleapis.com/v2/publishers/${publisherId}/items/${extensionId}:fetchStatus`;

  return requestJson(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

async function fetchFirefoxDetail() {
  const addonRef = requireEnv('FIREFOX_ADDON_REF');
  const baseUrl = getEnv('AMO_BASE_URL', DEFAULT_AMO_BASE_URL).replace(/\/$/, '');
  const url = `${baseUrl}/addons/addon/${encodeURIComponent(addonRef)}/`;
  return requestJson(url);
}

async function fetchFirefoxListedVersions() {
  const addonRef = requireEnv('FIREFOX_ADDON_REF');
  const baseUrl = getEnv('AMO_BASE_URL', DEFAULT_AMO_BASE_URL).replace(/\/$/, '');
  const url = `${baseUrl}/addons/addon/${encodeURIComponent(addonRef)}/versions/?filter=all_without_unlisted&page_size=50`;
  return requestJson(url, {
    headers: getAmoHeaders()
  });
}

function selectHighestVersion(versions) {
  return versions.reduce((highest, current) => {
    if (!highest) return current;
    return compareVersions(current.version, highest.version) > 0 ? current : highest;
  }, null);
}

function createAmoJwt() {
  const apiKey = requireEnv('AMO_API_KEY');
  const apiSecret = requireEnv('AMO_API_SECRET');
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: apiKey,
    jti: crypto.randomUUID(),
    iat: issuedAt,
    exp: issuedAt + 60
  };

  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

function getAmoHeaders(extraHeaders = {}) {
  return {
    Authorization: `JWT ${createAmoJwt()}`,
    ...extraHeaders
  };
}

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function poll(asyncFn, shouldStop, { attempts = 24, delayMs = 5000, label = 'poll' } = {}) {
  let lastValue;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastValue = await asyncFn();
    if (shouldStop(lastValue)) {
      return lastValue;
    }

    if (attempt < attempts) {
      console.log(`${label}: attempt ${attempt}/${attempts} incomplete, waiting ${delayMs}ms`);
      await sleep(delayMs);
    }
  }

  throw new Error(`${label}: timed out after ${attempts} attempts\n${JSON.stringify(lastValue, null, 2)}`);
}

async function runPreflight() {
  const { version } = getManifestVersions();
  const sourceCommit = git(['rev-parse', 'HEAD^']);
  const { version: publishVersion } = getManifestVersionsFromGit(sourceCommit);
  validateManifestVersion(version);
  validateManifestVersion(publishVersion);
  const publishChromeRequested = getEnv('PUBLISH_CHROME', 'true') === 'true';
  const publishFirefoxRequested = getEnv('PUBLISH_FIREFOX', 'true') === 'true';

  if (!publishChromeRequested && !publishFirefoxRequested) {
    throw new Error('Nothing to do: both PUBLISH_CHROME and PUBLISH_FIREFOX are false');
  }

  let chromeLiveVersion = '';
  let chromeSubmittedVersion = '';
  let chromeBlockedPending = false;
  let firefoxLiveVersion = '';
  let firefoxPendingVersion = '';
  let firefoxBlockedPending = false;
  let publishChrome = false;
  let publishFirefox = false;

  if (compareVersions(version, publishVersion) <= 0) {
    setOutput('manifest_version', version);
    setOutput('publish_version', publishVersion);
    setOutput('publish_chrome', 'false');
    setOutput('publish_firefox', 'false');
    setOutput('chrome_blocked_pending', 'false');
    setOutput('firefox_blocked_pending', 'false');
    setOutput('source_commit', sourceCommit || 'none');

    appendSummary([
      '## Store Preflight',
      '',
      `- Local manifest version: \`${version}\``,
      `- Lagged publish target version: \`${publishVersion}\``,
      `- Publish source commit: \`${sourceCommit}\``,
      '- Publish skipped: current manifest version has not advanced beyond the lagged publish target.'
    ]);
    return;
  }

  if (publishChromeRequested) {
    const chromeStatus = await fetchChromeStatus();
    chromeLiveVersion = getChromePublishedVersion(chromeStatus);
    chromeSubmittedVersion = getChromeSubmittedVersion(chromeStatus);

    if (chromeSubmittedVersion) {
      const submittedComparison = compareVersions(publishVersion, chromeSubmittedVersion);
      if (submittedComparison < 0) {
        throw new Error(
          `Publish target ${publishVersion} is older than submitted Chrome version ${chromeSubmittedVersion}`
        );
      }
      if (submittedComparison === 0) {
        publishChrome = false;
      } else {
        chromeBlockedPending = true;
        publishChrome = false;
      }
    } else if (!chromeLiveVersion) {
      publishChrome = true;
    } else {
      const comparison = compareVersions(publishVersion, chromeLiveVersion);
      if (comparison < 0) {
        throw new Error(`Publish target ${publishVersion} is older than live Chrome version ${chromeLiveVersion}`);
      }
      publishChrome = comparison > 0;
    }
  }

  if (publishFirefoxRequested) {
    const [firefoxDetail, firefoxVersions] = await Promise.all([
      fetchFirefoxDetail(),
      fetchFirefoxListedVersions()
    ]);

    firefoxLiveVersion = firefoxDetail?.current_version?.version || '';
    const listedVersions = firefoxVersions?.results || [];
    const matchingVersion = listedVersions.find((entry) => entry.version === publishVersion);
    const highestListedVersion = selectHighestVersion(listedVersions);
    const pendingListedVersion = listedVersions.find((entry) => entry?.file?.status === 'unreviewed');

    firefoxPendingVersion = pendingListedVersion?.version || '';

    if (matchingVersion) {
      if (matchingVersion?.file?.status === 'public' || matchingVersion?.file?.status === 'unreviewed') {
        publishFirefox = false;
      } else {
        throw new Error(
          `Firefox already has publish target ${publishVersion} with status ${matchingVersion?.file?.status || 'unknown'}; choose a new local version before republishing`
        );
      }
    } else if (highestListedVersion && compareVersions(publishVersion, highestListedVersion.version) < 0) {
      throw new Error(
        `Publish target ${publishVersion} is older than existing Firefox version ${highestListedVersion.version}`
      );
    } else if (firefoxPendingVersion) {
      firefoxBlockedPending = true;
      publishFirefox = false;
    } else if (!firefoxLiveVersion) {
      publishFirefox = true;
    } else {
      const comparison = compareVersions(publishVersion, firefoxLiveVersion);
      if (comparison < 0) {
        throw new Error(`Publish target ${publishVersion} is older than live Firefox version ${firefoxLiveVersion}`);
      }
      publishFirefox = comparison > 0;
    }
  }

  setOutput('manifest_version', version);
  setOutput('publish_version', publishVersion);
  setOutput('publish_chrome', String(publishChrome));
  setOutput('publish_firefox', String(publishFirefox));
  setOutput('chrome_blocked_pending', String(chromeBlockedPending));
  setOutput('firefox_blocked_pending', String(firefoxBlockedPending));
  setOutput('source_commit', sourceCommit || 'none');
  setOutput('chrome_live_version', chromeLiveVersion || 'none');
  setOutput('chrome_submitted_version', chromeSubmittedVersion || 'none');
  setOutput('firefox_live_version', firefoxLiveVersion || 'none');
  setOutput('firefox_pending_version', firefoxPendingVersion || 'none');

  appendSummary([
    '## Store Preflight',
    '',
    `- Local manifest version: \`${version}\``,
    `- Lagged publish target version: \`${publishVersion}\``,
    `- Publish source commit: \`${sourceCommit}\``,
    `- Chrome live version: \`${chromeLiveVersion || 'none'}\``,
    `- Chrome submitted version: \`${chromeSubmittedVersion || 'none'}\``,
    `- Chrome blocked by pending review: \`${chromeBlockedPending}\``,
    `- Firefox live version: \`${firefoxLiveVersion || 'none'}\``,
    `- Firefox pending version: \`${firefoxPendingVersion || 'none'}\``,
    `- Firefox blocked by pending review: \`${firefoxBlockedPending}\``,
    `- Publish Chrome: \`${publishChrome}\``,
    `- Publish Firefox: \`${publishFirefox}\``
  ]);
}

async function runPublishChrome() {
  const version = getExpectedPublishVersion();
  const token = requireEnv('CHROME_ACCESS_TOKEN');
  const publisherId = requireEnv('CHROME_PUBLISHER_ID');
  const extensionId = requireEnv('CHROME_EXTENSION_ID');
  const packagePath = requireEnv('CHROME_PACKAGE_PATH');

  if (!fileExists(packagePath)) {
    throw new Error(`Chrome package not found: ${packagePath}`);
  }

  const uploadUrl = `https://chromewebstore.googleapis.com/upload/v2/publishers/${publisherId}/items/${extensionId}:upload`;
  const publishUrl = `https://chromewebstore.googleapis.com/v2/publishers/${publisherId}/items/${extensionId}:publish`;
  const fileBuffer = fs.readFileSync(path.resolve(ROOT, packagePath));

  const uploadResult = await requestJson(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream'
    },
    body: fileBuffer
  });

  let uploadState = uploadResult.uploadState;
  if (uploadState === 'FAILED') {
    throw new Error(`Chrome upload failed\n${JSON.stringify(uploadResult, null, 2)}`);
  }

  if (uploadState === 'IN_PROGRESS') {
    const statusResult = await poll(
      fetchChromeStatus,
      (payload) => payload?.lastAsyncUploadState && payload.lastAsyncUploadState !== 'IN_PROGRESS',
      { label: 'chrome upload status', attempts: 30, delayMs: 5000 }
    );
    uploadState = statusResult.lastAsyncUploadState;
    if (uploadState !== 'SUCCEEDED') {
      throw new Error(`Chrome async upload finished in unexpected state: ${uploadState}`);
    }
  }

  if (uploadResult.crxVersion && uploadResult.crxVersion !== version) {
    throw new Error(`Chrome upload version mismatch: expected ${version}, got ${uploadResult.crxVersion}`);
  }

  const publishResult = await requestJson(publishUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      publishType: 'DEFAULT_PUBLISH',
      skipReview: false,
      blockOnWarnings: true
    })
  });

  setOutput('chrome_submitted_version', version);
  setOutput('chrome_publish_state', publishResult.state || 'UNKNOWN');

  const warnings = publishResult?.warningInfo?.warnings || [];
  appendSummary([
    '## Chrome Publish',
    '',
    `- Submitted version: \`${version}\``,
    `- Publish state: \`${publishResult.state || 'UNKNOWN'}\``,
    `- Warnings: \`${warnings.length}\``
  ]);
}

async function runPublishFirefox() {
  const version = getExpectedPublishVersion();
  const addonRef = requireEnv('FIREFOX_ADDON_REF');
  const packagePath = requireEnv('FIREFOX_PACKAGE_PATH');
  const baseUrl = getEnv('AMO_BASE_URL', DEFAULT_AMO_BASE_URL).replace(/\/$/, '');
  const releaseNotes = getEnv('FIREFOX_RELEASE_NOTES');
  const approvalNotes = getEnv('FIREFOX_APPROVAL_NOTES');

  if (!fileExists(packagePath)) {
    throw new Error(`Firefox package not found: ${packagePath}`);
  }

  const fileBuffer = fs.readFileSync(path.resolve(ROOT, packagePath));
  const uploadForm = new FormData();
  uploadForm.append('channel', 'listed');
  uploadForm.append('upload', new Blob([fileBuffer]), path.basename(packagePath));

  const uploadResult = await requestJson(`${baseUrl}/addons/upload/`, {
    method: 'POST',
    headers: getAmoHeaders(),
    body: uploadForm
  });

  const uploadUuid = uploadResult.uuid;
  if (!uploadUuid) {
    throw new Error(`Firefox upload did not return a UUID\n${JSON.stringify(uploadResult, null, 2)}`);
  }

  const uploadStatus = await poll(
    () => requestJson(`${baseUrl}/addons/upload/${uploadUuid}/`, { headers: getAmoHeaders() }),
    (payload) => payload.processed === true,
    { label: 'firefox upload validation', attempts: 30, delayMs: 5000 }
  );

  if (!uploadStatus.valid) {
    throw new Error(`Firefox upload validation failed\n${JSON.stringify(uploadStatus.validation, null, 2)}`);
  }

  const versionPayload = {
    upload: uploadUuid,
    compatibility: ['firefox']
  };

  if (releaseNotes) {
    versionPayload.release_notes = { 'en-US': releaseNotes };
  }

  if (approvalNotes) {
    versionPayload.approval_notes = approvalNotes;
  }

  const versionResult = await requestJson(`${baseUrl}/addons/addon/${encodeURIComponent(addonRef)}/versions/`, {
    method: 'POST',
    headers: getAmoHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(versionPayload)
  });

  if (versionResult.version !== version) {
    throw new Error(`Firefox submitted version mismatch: expected ${version}, got ${versionResult.version}`);
  }

  setOutput('firefox_submitted_version', version);
  setOutput('firefox_version_status', versionResult?.file?.status || 'UNKNOWN');

  appendSummary([
    '## Firefox Publish',
    '',
    `- Submitted version: \`${version}\``,
    `- File status: \`${versionResult?.file?.status || 'UNKNOWN'}\``,
    `- Review URL: ${versionResult.edit_url || 'n/a'}`
  ]);
}

async function main() {
  const command = process.argv[2];
  const targetFilePath = process.argv[3];
  const targetVersion = process.argv[4];

  switch (command) {
    case 'preflight':
      await runPreflight();
      return;
    case 'stamp-manifest-version':
      if (!targetFilePath || !targetVersion) {
        throw new Error('Usage: node scripts/store-publish.js stamp-manifest-version <filePath> <version>');
      }
      stampManifestVersion(targetFilePath, targetVersion);
      return;
    case 'publish-chrome':
      await runPublishChrome();
      return;
    case 'publish-firefox':
      await runPublishFirefox();
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
