const fs = require('fs');
let layout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');

const logoMask = "<div className='w-full h-full' style={{\n" +
"            maskImage: 'url(/omnia.png)',\n" +
"            WebkitMaskImage: 'url(/omnia.png)',\n" +
"            maskSize: 'contain',\n" +
"            WebkitMaskSize: 'contain',\n" +
"            maskRepeat: 'no-repeat',\n" +
"            WebkitMaskRepeat: 'no-repeat',\n" +
"            maskPosition: 'center',\n" +
"            WebkitMaskPosition: 'center',\n" +
"            backgroundColor: 'var(--ink)'\n" +
"          }} />";

layout = layout.replace(
  "<img src='/omnia.png' alt='Omnia' className='h-28 w-48 object-contain scale-110 drop-shadow-lg' style={{ filter: 'brightness(1.5)' }} />",
  "<div className='h-20 w-40'>" + logoMask + "</div>"
);

layout = layout.replace(
  "<img src='/omnia.png' alt='Omnia' className='h-12 w-32 object-contain scale-110' style={{ filter: 'brightness(1.5)' }} />",
  "<div className='h-10 w-28'>" + logoMask + "</div>"
);

fs.writeFileSync('src/layouts/AppLayout.jsx', layout, 'utf8');
