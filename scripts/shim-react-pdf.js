// This patching is required so we can inject
// global, process, and Buffer onto the window object
// in the two Node libraries included in React PDF.

const fs = require("fs");

const banner = "/* Injected by vite-plugin-shim-react-pdf */";

try {
  require.resolve("@react-pdf/renderer");
} catch {
  console.warn();
  console.warn("Could not resolve @react-pdf/renderer, is it installed?");
  console.warn("Skipping patching...");
  console.warn();
  process.exit(0);
}

const prependFiles = (nodeResolutionPaths, prependContent) => {
  if (!Array.isArray(nodeResolutionPaths)) {
    nodeResolutionPaths = [nodeResolutionPaths];
  }

  for (const nodeResolutionPath of nodeResolutionPaths) {
    const path = require.resolve(nodeResolutionPath);
    const contents = fs.readFileSync(path, { encoding: "utf-8" });

    if (!contents.startsWith(banner)) {
      console.log(`Patching '${nodeResolutionPath}'...`);
      fs.writeFileSync(
        path,
        `${banner}
       ${prependContent}
       ${contents}`
      );
    } else {
      console.log(` - Skipping '${nodeResolutionPath}', already patched...`);
    }
  }
};

// A bunch of things from this import need 'global', 'process', and 'EventEmitter'.
prependFiles(
  "blob-stream",
  `
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // inside a web worker, the global scope is called "self"
    self.global = self
    self.window = self
  }
  
  if (typeof window !== 'undefined') {
    window.global = window;
    window.process = require('process');
    window.EventEmitter = require('events');
  }
  `
);

// Buffer a go go.
// We're shimming every file individually in this case because
// they get resolved in a non-deterministic order, so it's easiest
// to just get them all individually.
prependFiles(
  [
    "@react-pdf/pdfkit/lib/pdfkit.browser.es.js",
    "@react-pdf/fontkit/lib/fontkit.browser.es.js",
    "@react-pdf/png-js/lib/png-js.browser.es.js",
  ],
  "import { Buffer } from 'buffer';"
);
prependFiles(
  [
    "@react-pdf/font/lib/index.browser.js",
    "@react-pdf/image/lib/index.browser.js",
    "restructure/src/DecodeStream.js",
    "restructure/src/EncodeStream.js",
    "restructure/src/String.js",
  ],
  `const { Buffer } = require('buffer');`
);
