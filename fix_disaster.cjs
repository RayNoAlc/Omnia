const fs = require('fs');
let file = 'src/components/Tabs.jsx';
let content = fs.readFileSync(file, 'utf8');

// The only place a sleeping emoji is intended is in the text "Esperando você estudar..." or similar.
// But wait, the emojis were removed when we went back to the original FocusPet animation (since it's an image now).
// Oh wait, the initial backup STILL HAD emojis in FocusPet before we replaced it with the image!
// Wait! `10e364a` was the initial backup. In the initial backup, the FocusPet was a sprite sheet! We changed it to an image later?
// NO! The initial backup `10e364a` was the backup I made AFTER we had the 1x3 sprite sheet `pet_sprites.png`!
// Let me check if `Y` is used in `Tabs.jsx`.
// Let's replace `getFull😴ear` back to `getFullYear`.
content = content.replace(/getFull😴ear/g, 'getFullYear');

// What other Ys could be broken?
// 'Y' in classNames? No classNames usually have Y.
// 'Y' in components? 'YouTube'? -> '😴ouTube' or '😴ouTube'
content = content.replace(/😴ouTube/g, 'YouTube');
content = content.replace(/😴OUTUBE/g, 'YOUTUBE');

// Let's just review all '😴' in Tabs.jsx
fs.writeFileSync(file, content, 'utf8');
