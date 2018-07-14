const fs = require('fs');
const gen = fs.readFileSync('../answer.mkv');
const out = fs.readFileSync('../out.mkv');
// verify header correctness
fs.writeFileSync('../combined.mkv', Buffer.concat([gen.slice(0,36), out.slice(36)]));
