# vite-plugin-shim-react-pdf

Adds necessary shims so that React PDF can be used with Vite.

## Usage

```console
$ yarn add @react-pdf/renderer
$ yarn add --dev vite-plugin-shim-react-pdf
```

Then in `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import shimReactPdf from "vite-plugin-shim-react-pdf";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), shimReactPdf()],
});
```

Both `yarn dev` and `yarn build` should now work correctly in your Vite project.
