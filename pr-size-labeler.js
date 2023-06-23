const { execSync } = require('child_process');

function countPRSize() {
  const diffCommand = 'git diff --stat FETCH_HEAD $(git merge-base FETCH_HEAD origin/main)';
  const diffOutput = execSync(diffCommand).toString();
  const linesOfCode = diffOutput.split(',').pop().split(' ')[1];
  return parseInt(linesOfCode, 10);
}

const prSize = countPRSize();
console.log(`PR Size: ${prSize}`);
console.log(`PR_SIZE=${prSize}`);