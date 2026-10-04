const fs = require('fs');

let appLayout = fs.readFileSync('src/layouts/AppLayout.jsx', 'utf8');
// Desktop sidebar
appLayout = appLayout.replace(
  /<img src="\/omnia\.png" alt="Omnia" className="h-16 object-contain" \/>/,
  '<img src="/omnia.png" alt="Omnia" className="h-28 w-full object-contain mix-blend-screen opacity-90 drop-shadow-xl" />'
);
// Mobile header
appLayout = appLayout.replace(
  /<img src="\/omnia\.png" alt="Omnia" className="h-8 object-contain" \/>/,
  '<img src="/omnia.png" alt="Omnia" className="h-12 w-32 object-contain mix-blend-screen opacity-90 drop-shadow-lg" />'
);

// Note: since the new image is dark blue text, and the sidebar is dark blue (#141C2F), dark blue on dark blue might be very hard to read!
// I'll add rightness-200 invert to make it visible, but actually the user uploaded a blue image. Let's just use it as is, but maybe add some brightness or drop-shadow. No, let's just make it big first.
