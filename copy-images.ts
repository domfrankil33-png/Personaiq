import fs from 'fs';
import path from 'path';

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} -> ${destPath}`);
    }
  }
}

try {
  const srcDir = path.join(process.cwd(), 'src', 'assets', 'images');
  const destDir = path.join(process.cwd(), 'public', 'images');
  
  console.log(`Copying images from ${srcDir} to ${destDir}...`);
  copyDir(srcDir, destDir);
  console.log('Copying completed successfully!');
} catch (err) {
  console.error('Error copying images:', err);
  process.exit(1);
}
