// This patching is required so we can inject
// global, process, and Buffer onto the window object
// in the two Node libraries included in React PDF.

const fs = require("fs");

const banner = "/* Injected by vite-plugin-shim-react-pdf */";

const prependFile = (nodeResolutionPath, prependContent) => {
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
};

// A bunch of things from this import need 'global' and 'process'.
prependFile(
  "blob-stream",
  `
    window.global = window;
    window.process = require('process/browser');
  `
);

// Buffer a go go
prependFile(
  "restructure",
  `
    const { Buffer } = require('buffer');
    window.Buffer = Buffer;
  `
);
