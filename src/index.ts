import { Network, FieldGraph, PinFilter } from "@/simulation";
import { kohctpyktop } from "@/circuits/kohctpyktop";

const vccFilter: PinFilter = (id, pin) => {
  switch (id) {
    default: return true;
    case 0:
    case 1:
    case 10:
    case 11:
      return false;
  }
}

const saveString = 'eNrtmltywyAMRY2uf7KGbqH/XUv3v5G2fg+giwGT+iF7nMnkIHQtIo1i0n/2H69v9/pyfVdy3spQhrPI0KU8OvXMkOpK79EMzZBPwQydnhvMcDaRXI9u8pqdHWLBseBYcI4NTlcanGc1D+cxHNo50Y+BAohe9fSX993oCcPxJ0pk/GwesarB+J7g9dY2Q4TPIJEZZJqCDFncqGO2MQxUJLBciQ5LF6MjgGKLaYioFDpdDjZzkSpQVahQhRpVoKpQoQo1qiBJv0FB8VQBkWTYIo0vzBvQsmBphXJXJTVq1KjRZ9NTlUqU28KW+C2UxBnMFk3XyFRdXZWVykyKvEKKY8qs0d2pBD3OHsy0NVV3V2Wl8sgkRdEXAHRmo5mUxJl1HaBdB2Cqrq3qCcXwLqUyYrt9bmyd4TsoiTNSadhujUzV1VXdplRWboHHH3ao298arelIjTalmF8JFVDKbalfYTvduipQVaCqkPYrbKebqAJVBaoKSb/CdrqZKr/lDKmoNFjhyCrE6UpwYEVqWirjVz3d5iDseePJqZcRe5Ml9vvN72fYzPrfUbgqaaZKalRJM1VSo0qaqQoXMdCsx/n/KpJ3/ABKzMkh';
const field = FieldGraph.from(saveString);
const net = Network.from(field);
const sim = kohctpyktop['14 KC74S 4-BIT SHIFT REGISTER S-TO-P'](net);
sim.run(280);

const verification = sim.verify('kohctpyktop');
const grade = verification.gradePercent;
const designScore = field.getDesignScore();
console.log('KC74S - 4-BIT SHIFT REGISTER (S-TO-P)')
sim.printHistoryScope({ pinOrder: "even-odd", filter: vccFilter, padding: 1, horizontal: false });
for (const out of verification.outputs) {
  console.log(`Pin ${out.pin.label} has ${out.differences} differences (${(out.ratio * 100).toFixed(2)}%)`);
}
console.log(`DESIGN SCORE: ${designScore} (lower is better)`)
if (grade >= 97) {
  console.log(`VERIFICATION TEST PASSED (${grade}%) - FLAGGED AS COMPLETED`);
} else {
  console.log(`VERIFICATION TEST FAILED (${grade}%)`);
}
