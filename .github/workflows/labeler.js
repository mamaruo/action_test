const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const labels = [
  { name: "small", minLines: 1, maxLines: 100 },
  { name: "medium", minLines: 101, maxLines: 1000 },
  { name: "large", minLines: 1001, maxLines: Infinity },
];

async function run() {
  const pullRequest = await getPullRequest();

  if (!pullRequest) {
    console.log("Could not retrieve pull request information.");
    return;
  }

  const linesChanged = pullRequest.additions + pullRequest.deletions;

  const labelToAdd = getLabelForLinesChanged(linesChanged);

  if (labelToAdd) {
    await addLabelToPullRequest(pullRequest.number, labelToAdd);
  }
}

async function getPullRequest() {
  try {
    const { data } = await octokit.pulls.get({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      pull_number: process.env.PULL_REQUEST_NUMBER,
    });

    return data;
  } catch (error) {
    console.log("Error retrieving pull request:", error);
    return null;
  }
}

function getLabelForLinesChanged(linesChanged) {
  for (const label of labels) {
    if (linesChanged >= label.minLines && linesChanged <= label.maxLines) {
      return label.name;
    }
  }

  return null;
}

async function addLabelToPullRequest(pullRequestNumber, label) {
  try {
    await octokit.issues.addLabels({
      owner: process.env.GITHUB_REPOSITORY_OWNER,
      repo: process.env.GITHUB_REPOSITORY,
      issue_number: pullRequestNumber,
      labels: [label],
    });

    console.log(`Added "${label}" label to pull request #${pullRequestNumber}.`);
  } catch (error) {
    console.log("Error adding label to pull request:", error);
  }
}

run().catch((error) => console.log("Error:", error));
