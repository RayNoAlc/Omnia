const { jsPDF } = require('jspdf');
require('jspdf-autotable');

const doc = new jsPDF();
doc.autoTable({
  head: [['A']],
  body: [['1']]
});

console.log(doc.lastAutoTable ? 'lastAutoTable exists' : 'NO lastAutoTable');
console.log(doc.previousAutoTable ? 'previousAutoTable exists' : 'NO previousAutoTable');
