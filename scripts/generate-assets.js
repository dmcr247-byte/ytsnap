const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_IMAGE = 'C:/Users/Amarjeet/.gemini/antigravity/brain/df2723b7-3a09-41b6-898f-4b6e31b714d8/.user_uploaded/media_1794549356743_6ab85798.png';

async function main() {
  console.log('Generating logo and favicon assets...');

  const publicDir = path.join(process.cwd(), 'public');
  const appDir = path.join(process.cwd(), 'src', 'app');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // 1. Copy full logo to public/logo.png (1024x1024)
  await sharp(SOURCE_IMAGE)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✓ Created public/logo.png');

  // 2. Extract clapperboard icon (center ~ (512, 315), width 600, height 600)
  // Let's crop from y=50, height=530, x=190, width=644 with padding
  const iconCrop = await sharp(SOURCE_IMAGE)
    .extract({ left: 160, top: 50, width: 704, height: 530 })
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'logo-icon.png'), iconCrop);
  console.log('✓ Created public/logo-icon.png');

  // 3. Next.js App Router Site Icon (src/app/icon.png) - 512x512
  fs.writeFileSync(path.join(appDir, 'icon.png'), iconCrop);
  console.log('✓ Created src/app/icon.png');

  // 4. Apple Touch Icon (src/app/apple-icon.png) - 180x180
  const appleIcon = await sharp(iconCrop)
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIcon);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
  console.log('✓ Created src/app/apple-icon.png');

  // 5. Favicon PNG (32x32 and 48x48)
  const favicon32 = await sharp(iconCrop).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), favicon32);
  console.log('✓ Created favicon.ico');

  // 6. Web Manifest / PWA icons
  const icon192 = await sharp(iconCrop).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  console.log('✓ All assets generated successfully!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
