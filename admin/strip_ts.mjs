import fs from "fs";
import path from "path";
import babel from "@babel/core";

const uiPath = path.join(process.cwd(), "src/components/ui");
const files = fs.readdirSync(uiPath).filter(f => f.endsWith(".jsx") || f.endsWith(".js"));

for (const file of files) {
  const filePath = path.join(uiPath, file);
  const code = fs.readFileSync(filePath, "utf-8");

  try {
    const result = babel.transformSync(code, {
      filename: filePath,
      presets: [
        ["@babel/preset-typescript", { isTSX: true, allExtensions: true }]
      ],
      retainLines: true,
    });
    if (result && result.code) {
      fs.writeFileSync(filePath, result.code);
      console.log(`Transformed ${file}`);
    }
  } catch (err) {
    console.error(`Failed to transform ${file}:`, err.message);
  }
}
