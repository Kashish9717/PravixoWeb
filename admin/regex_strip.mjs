import fs from 'fs';
import path from 'path';

const uiPath = path.join(process.cwd(), 'src/components/ui');
const files = fs.readdirSync(uiPath).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(uiPath, file);
  let code = fs.readFileSync(filePath, 'utf-8');

  // Strip React.forwardRef<...>(
  code = code.replace(/React\.forwardRef<[^>]+>\(/g, 'React.forwardRef(');
  // Strip export interface ... { ... }
  code = code.replace(/export interface [^{]+\{[\s\S]*?\}/g, '');
  // Strip : Type annotations in function parameters (basic)
  code = code.replace(/({[^}]+})\s*:\s*[A-Za-z]+/g, '$1');

  fs.writeFileSync(filePath, code);
  console.log(`Processed ${file}`);
}
