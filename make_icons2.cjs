const { Jimp } = require('jimp');

async function makeIcons() {
  try {
    const logo = await Jimp.read('public/omnia.png');
    // logo width/height. We want it to fit inside the icon with some padding.
    // Let's create a 512x512 image filled with #FFFFFF
    const icon512 = new Jimp({ width: 512, height: 512, color: '#FFFFFF' });
    const icon192 = new Jimp({ width: 192, height: 192, color: '#FFFFFF' });

    // Scale logo to fit nicely. 512 icon -> max width 400
    logo.scaleToFit({ w: 400, h: 400 });

    // Center it
    const x = (512 - logo.bitmap.width) / 2;
    const y = (512 - logo.bitmap.height) / 2;

    icon512.composite(logo, x, y);

    // Now for 192
    const logoSmall = logo.clone();
    logoSmall.scaleToFit({ w: 150, h: 150 });
    const x192 = (192 - logoSmall.bitmap.width) / 2;
    const y192 = (192 - logoSmall.bitmap.height) / 2;

    icon192.composite(logoSmall, x192, y192);

    await icon512.write('public/pwa-512x512.png');
    await icon192.write('public/pwa-192x192.png');
    
    // Also create maskable icon which is slightly smaller logo to ensure it fits in circles
    const maskable512 = new Jimp({ width: 512, height: 512, color: '#FFFFFF' });
    const logoMaskable = logo.clone();
    logoMaskable.scaleToFit({ w: 300, h: 300 });
    maskable512.composite(logoMaskable, (512 - logoMaskable.bitmap.width) / 2, (512 - logoMaskable.bitmap.height) / 2);
    await maskable512.write('public/pwa-maskable-512x512.png');

    console.log('Icons created!');
  } catch(e) {
    console.error(e);
  }
}

makeIcons();
