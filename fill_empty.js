const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (['node_modules', '.git', '.next', 'my-personal-site', 'public'].includes(file)) return;
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (stat.size === 0) results.push(file);
    }
  });
  return results;
}

const emptyFiles = walk(__dirname);

emptyFiles.forEach(file => {
  const ext = path.extname(file);
  const basename = path.basename(file);
  
  if (ext === '.tsx') {
    if (basename === 'page.tsx') {
      fs.writeFileSync(file, 'export default function Page() { return <div>Page</div>; }\n');
    } else if (basename === 'layout.tsx') {
      fs.writeFileSync(file, 'export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }\n');
    } else {
      const componentName = basename.replace('.tsx', '').replace(/[^a-zA-Z0-9]/g, '');
      fs.writeFileSync(file, `export default function ${componentName}() { return <div>${componentName}</div>; }\n`);
    }
    console.log(`Filled ${file}`);
  } else if (ext === '.ts') {
    if (basename === 'route.ts') {
      fs.writeFileSync(file, 'import { NextResponse } from "next/server";\nexport async function GET() { return NextResponse.json({ status: "ok" }); }\nexport async function POST() { return NextResponse.json({ status: "ok" }); }\n');
    } else {
      const exportName = basename.replace('.ts', '').replace(/[^a-zA-Z0-9]/g, '');
      fs.writeFileSync(file, `export const ${exportName || 'placeholder'} = () => {};\n`);
    }
    console.log(`Filled ${file}`);
  }
});

console.log("Done filling empty files.");
