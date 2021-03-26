const core = require('@actions/core');
const parseChangelog = require('changelog-parser');
const compareVersions = require('compare-versions');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const lastVersion = core.getInput('lastVersion');
    const changelogPath = core.getInput('changelogPath');
    const changelog = await parseChangelog(changelogPath);
    let changes = '';
    if (lastVersion === 'latest') {
      changes = changelog.versions[0].body;
    } else {
      if (compareVersions.validate(lastVersion)) {
        core.setFailed(`lastVersion ${lastVersion} do no follow semver`);
      }
      changelog.versions.forEach((version) => {
        if (compareVersions.validate(version.version)) {
          core.setFailed(`version ${version.version} do no follow semver`);
        }
        if (compareVersions.compare(lastVersion, version.version, '>')) {
          if (changes !== '') {
            changes += "\n";
          }
          changes += version.body;
        }
      });
    }

    core.info(changes);

    core.setOutput('lastChanges', changes);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
