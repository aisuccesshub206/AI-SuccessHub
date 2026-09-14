import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
  console.log('Generating 1024x1024 icon PNGs from public/icon.svg...');

  // 1. Icon PNG (1024x1024)
  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-only.png'));

  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-foreground.png'));

  console.log('Generating 2732x2732 splash PNGs...');
  // 2. Splash PNG (2732x2732 with dark background and centered logo)
  const logoResized = await sharp(svgPath)
    .resize(800, 800)
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 2, g: 2, b: 5, alpha: 1 }
    }
  })
    .composite([
      {
        input: logoResized,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 2, g: 2, b: 5, alpha: 1 }
    }
  })
    .composite([
      {
        input: logoResized,
        gravity: 'center'
      }
    ])
    .png()
    .toFile(path.join(assetsDir, 'splash-dark.png'));

  console.log('Assets generated successfully in /assets folder!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
