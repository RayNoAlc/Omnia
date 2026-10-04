const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');

// In node it might be different, let's try autoTable default export
const autoTableFunc = autoTable.default || autoTable;

const doc = new jsPDF();
autoTableFunc(doc, {
  head: [['A']],
  body: [['1']]
});

console.log(doc.lastAutoTable ? 'lastAutoTable exists' : 'NO lastAutoTable');
console.log(doc.previousAutoTable ? 'previousAutoTable exists' : 'NO previousAutoTable');
