const fs = require('fs');
const f = 'src/pages/admin/dossier/ProfileTab.jsx';
let s = fs.readFileSync(f, 'utf8');

// Fix dark card initials and stats readability: add #fff colors
s = s.replace('fontSize:"1.8rem",fontWeight:900,letterSpacing:"-.02em"}}>', 'fontSize:"1.8rem",fontWeight:900,letterSpacing:"-.02em",color:"#fff"}}>');
s = s.replace('<StatNum>', '<StatNum style={{color:"#fff"}}>');
s = s.replace('<StatLab>', '<StatLab style={{color:"rgba(255,255,255,.7)"}}>');

// Fix stage pill: white pill with dark green bold text
// The pill already has color:#fff; change to dark green text on white bg
// Search for stage pill style block and swap colors
s = s.replace('background:"rgba(255,255,255,.15)",color:"#fff"', 'background:"#fff",color:"#047857"');

// Fix agency fee text and progress bar
s = s.replace('color:C.text', 'color:"#1B2B22"'); // light mode text

// Ensure left and right are direct siblings of wrapper (already are, but verify right cards are inside right div not extra grid items)
// The spec: left div closes after Agency fee; right div contains 3 cards stacked.
// We just need to ensure no extra div inside wrapper besides left/right.

fs.writeFileSync(f, s);
console.log('Fixes applied');
