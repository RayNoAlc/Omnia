const { Jimp, rgbaToInt, intToRGBA } = require('jimp');

async function makeTransparent() {
  const image = await Jimp.read('public/pet_sprites.jpg');
  image.scan((x, y, idx) => {
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    
    // If it's very dark (close to black)
    if (r < 20 && g < 20 && b < 20) {
      image.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
    }
  });
  await image.write('public/pet_sprites.png');
  console.log("Image processed successfully!");
}

makeTransparent().catch(console.error);
