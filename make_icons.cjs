const Jimp = require('jimp');

async function makeIcons() {
  try {
    const logo = await Jimp.read('public/omnia.png');
    // logo width/height. We want it to fit inside the icon with some padding.
    // Let's create a 512x512 image filled with #FFFFFF
    const icon512 = new Jimp(512, 512, '#FFFFFF');
    const icon192 = new Jimp(192, 192, '#FFFFFF');

    // Scale logo to fit nicely. 512 icon -> max width 400
    logo.scaleToFit(400, 400);

    // Center it
    const x = (512 - logo.bitmap.width) / 2;
    const y = (512 - logo.bitmap.height) / 2;

    icon512.composite(logo, x, y);

    // Now for 192
    const logoSmall = logo.clone();
    logoSmall.scaleToFit(150, 150);
    const x192 = (192 - logoSmall.bitmap.width) / 2;
    const y192 = (192 - logoSmall.bitmap.height) / 2;

    icon192.composite(logoSmall, x192, y192);

    await icon512.writeAsync('public/pwa-512x512.png');
    await icon192.writeAsync('public/pwa-192x192.png');
    
    // Also create maskable icon which is slightly smaller logo to ensure it fits in circles
    const maskable512 = new Jimp(512, 512, '#FFFFFF');
    const logoMaskable = logo.clone();
    logoMaskable.scaleToFit(300, 300);
    maskable512.composite(logoMaskable, (512 - logoMaskable.bitmap.width) / 2, (512 - logoMaskable.bitmap.height) / 2);
    await maskable512.writeAsync('public/pwa-maskable-512x512.png');

    console.log('Icons created!');
  } catch(e) {
    console.error(e);
  }
}

makeIcons();
