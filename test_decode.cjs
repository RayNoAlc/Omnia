// Test: manually decode the emoji bytes through cp1252 reverse mapping
const cp1252Reverse = new Map([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
  [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
  [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
  [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F],
]);

// Raw ZIP bytes for 🌙: c3 b0 c5 b8 c5 92 e2 84 a2
const rawHex = 'c3b0c5b8c592e284a2';
const str = Buffer.from(rawHex, 'hex').toString('utf8');
console.log('Step 1 - UTF-8 decoded chars:');
for (const c of str) {
  const code = c.charCodeAt(0);
  console.log(`  U+${code.toString(16).padStart(4,'0')} = ${c} (mapped: ${cp1252Reverse.has(code) ? '0x'+cp1252Reverse.get(code).toString(16) : (code<=255 ? '0x'+code.toString(16)+' direct' : 'MULTI-BYTE SKIP')})`);
}

// The issue: after one cp1252 decode, we get bytes [0xF0, 0x9F, 0x8C, 0x99]
// which IS 🌙 in UTF-8. But my script might be iterating wrong.
// Let me trace through my actual script logic:
const bytes = [];
for (const c of str) {
  const code = c.charCodeAt(0);
  const cp1252Byte = cp1252Reverse.get(code);
  if (cp1252Byte !== undefined) {
    bytes.push(cp1252Byte);
  } else if (code <= 255) {
    bytes.push(code);
  } else {
    // Multi-byte - this is the problem! Some chars like ð (U+00F0) are <=255
    // but Ÿ (U+0178) is >255 and IS in cp1252Reverse
    const charBuf = Buffer.from(c, 'utf8');
    for (const b of charBuf) bytes.push(b);
  }
}
console.log('\nResult bytes:', bytes.map(b => '0x'+b.toString(16)));
console.log('Result hex:', Buffer.from(bytes).toString('hex'));
console.log('Result UTF-8:', Buffer.from(bytes).toString('utf8'));
