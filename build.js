const buildOption = {
  entryPoints: ["src/app.tsx"],
  bundle: true,
  outdir: "dist",
  define: {
    "process.env.NODE_ENV": process.env.NODE_ENV
      ? `"${process.env.NODE_ENV}"`
      : '""',
    "process.env.WS_HOST": `"${process.env.WS_HOST || "localhost:8080"}"`,
  },
  logLevel: "info",
  sourcemap: true,
  format: "iife",
  loader: {
    ".wasm": "binary",
  },
};

if (require.main === module) {
  require("esbuild")
    .build(buildOption)
    .catch(() => process.exit(1));
}

module.exports = {
  buildOption,
};
