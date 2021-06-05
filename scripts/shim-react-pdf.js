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

// A bunch of things from this import need 'global' and 'process'.
prependFiles(
  "blob-stream",
  `
    window.global = window;
    window.process = require('process/browser');
  `
);

// Buffer a go go
prependFiles("@react-pdf/pdfkit", "import { Buffer } from 'buffer'");
prependFiles(
  ["restructure/src/DecodeStream.js", "restructure/src/EncodeStream.js"],
  `const { Buffer } = require('buffer');`
);
