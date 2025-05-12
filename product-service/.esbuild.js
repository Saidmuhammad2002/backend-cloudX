const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs");

const srcLambdaDir = path.join(__dirname, "src", "lambdas");
const distDir = path.join(__dirname, "dist");

// Ensure base dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Detect all .ts files in src/lambdas/ that export a 'handler'
const findHandlerFiles = () => {
  return fs.readdirSync(srcLambdaDir).filter((file) => {
    const fullPath = path.join(srcLambdaDir, file);
    return file.endsWith(".ts");
  });
};

const handlerFiles = findHandlerFiles();

console.log(`Bundling ${handlerFiles.length} Lambda handlers:`);

Promise.all(
  handlerFiles.map((file) => {
    const baseName = file.replace(".ts", "");
    const entryFile = path.join(srcLambdaDir, file);
    const outDir = path.join(distDir, baseName);

    // Ensure individual Lambda output folder exists
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    return esbuild
      .build({
        entryPoints: [entryFile],
        outfile: path.join(outDir, "index.js"),
        bundle: true,
        platform: "node",
        target: ["node20"],
        format: "cjs",
        minify: process.env.NODE_ENV === "production",
        logLevel: "info",
      })
      .then(() => {
        console.log(`✅ ${file} → ${outDir}/index.js`);
      });
  })
).catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
