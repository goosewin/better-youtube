/**
 * Better YouTube Extension Build Script
 * 
 * Builds browser-specific packages for Chrome and Firefox from a single source.
 * 
 * Author: Dan Goosewin <dan@goosewin.com>
 * Website: https://goosewin.com
 * Version: 0.1.2
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = '.';
const BUILD_DIR = './dist';

// Extension metadata
const EXTENSION_NAME = 'Better YouTube';
const EXTENSION_VERSION = '0.1.2';
const EXTENSION_AUTHOR = 'Dan Goosewin';
const EXTENSION_HOMEPAGE = 'https://goosewin.com';
const EXTENSION_DESCRIPTION = 'Hide YouTube Shorts across the site.';
const EXTENSION_ID = 'better-youtube@goosewin.com';

// Files to include in the build
const filesToCopy = [
  'content-script.js',
  'popup.js',
  'popup.html',
  'browser-polyfill.js',
  'icons/icon-16.png',
  'icons/icon-48.png',
  'icons/icon-128.png'
];

// Chrome manifest (uses host_permissions)
const chromeManifest = {
  manifest_version: 3,
  name: EXTENSION_NAME,
  description: EXTENSION_DESCRIPTION,
  version: EXTENSION_VERSION,
  author: EXTENSION_AUTHOR,
  homepage_url: EXTENSION_HOMEPAGE,
  permissions: ['storage'],
  host_permissions: ['https://www.youtube.com/*'],
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['browser-polyfill.js', 'content-script.js'],
      run_at: 'document_idle'
    }
  ],
  action: {
    default_popup: 'popup.html',
    default_icon: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png'
    }
  },
  icons: {
    16: 'icons/icon-16.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png'
  }
};

// Firefox manifest (MV3 uses host_permissions like Chrome)
const firefoxManifest = {
  manifest_version: 3,
  name: EXTENSION_NAME,
  description: EXTENSION_DESCRIPTION,
  version: EXTENSION_VERSION,
  author: EXTENSION_AUTHOR,
  homepage_url: EXTENSION_HOMEPAGE,
  permissions: ['storage'],
  host_permissions: ['https://www.youtube.com/*'],
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['browser-polyfill.js', 'content-script.js'],
      run_at: 'document_idle'
    }
  ],
  action: {
    default_popup: 'popup.html',
    default_icon: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png'
    }
  },
  icons: {
    16: 'icons/icon-16.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png'
  },
  browser_specific_settings: {
    gecko: {
      id: EXTENSION_ID,
      data_collection_permissions: {
        required: ["none"]
      }
    },
    gecko_android: {}
  }
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

function build() {
  console.log(`\n🔨 Building ${EXTENSION_NAME} v${EXTENSION_VERSION}...\n`);
  
  // Clean build directory
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
  }

  // Build for Chrome
  const chromeDir = path.join(BUILD_DIR, 'chrome');
  ensureDir(chromeDir);
  
  filesToCopy.forEach(file => {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(chromeDir, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      console.warn(`⚠️  Warning: ${file} not found`);
    }
  });

  fs.writeFileSync(
    path.join(chromeDir, 'manifest.json'),
    JSON.stringify(chromeManifest, null, 2)
  );
  console.log('✅ Chrome extension built in dist/chrome/');

  // Build for Firefox
  const firefoxDir = path.join(BUILD_DIR, 'firefox');
  ensureDir(firefoxDir);
  
  filesToCopy.forEach(file => {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(firefoxDir, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      console.warn(`⚠️  Warning: ${file} not found`);
    }
  });

  fs.writeFileSync(
    path.join(firefoxDir, 'manifest.json'),
    JSON.stringify(firefoxManifest, null, 2)
  );
  console.log('✅ Firefox extension built in dist/firefox/');

  console.log('\n📦 To package for distribution:');
  console.log('   Chrome:  npm run build:chrome');
  console.log('   Firefox: npm run build:firefox');
  console.log('\n📋 For local development:');
  console.log('   Chrome:  Load dist/chrome/ as unpacked extension');
  console.log('   Firefox: Load dist/firefox/ as temporary extension');
  console.log('');
}

build();
