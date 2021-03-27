# get-chagelog-diff

A Github Action to get last change in changelog as output.
To use in combination with notification system.

## Usage

```
name: Deployment
on: [tag]
jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      ...
      - name: Get the last version change
        uses: jupyter-naas/get-chagelog-diff@v1.0.3
        with:
          lastVersion: 'latest'
          changelogPath: './CHANGELOG.md'
      ...
```
