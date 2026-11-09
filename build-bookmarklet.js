const fs = require('fs');
const path = require('path');
const terser = require('./swiggy-telegram-bot/node_modules/terser');

async function build() {
  console.log('Reading swiggy-hunter-v4.js...');
  const srcPath = path.join(__dirname, 'swiggy-hunter-v4.js');
  const minPath = path.join(__dirname, 'swiggy-hunter-v4.min.js');
  const bmPath = path.join(__dirname, 'swiggy-hunter-v4.bookmarklet.txt');

  let raw = fs.readFileSync(srcPath, 'utf8');
  // Strip leading javascript: prefix
  raw = raw.replace(/^javascript:\s*/, '');

  console.log('Minifying with Terser...');
  const minified = await terser.minify(raw, {
    compress: {
      drop_console: false,
      passes: 2
    },
    mangle: true
  });

  if (minified.error) {
    console.error('Terser error:', minified.error);
    process.exit(1);
  }

  const minCode = minified.code;
  console.log(`Writing ${minPath} (${minCode.length} bytes)...`);
  fs.writeFileSync(minPath, minCode, 'utf8');

  const bookmarkletCode = 'javascript:' + encodeURIComponent(minCode);
  console.log(`Writing ${bmPath} (${bookmarkletCode.length} bytes)...`);
  fs.writeFileSync(bmPath, bookmarkletCode, 'utf8');

  console.log('Rebuild completed successfully!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
