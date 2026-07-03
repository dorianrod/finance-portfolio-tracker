---
name: release-version
description: >-
  Create a new release version for this finance portfolio tracker. Use when
  the user asks to create, bump, tag, or prepare a version/release. The skill
  retrieves the latest Git tag, asks whether the bump is major, minor, or patch,
  updates all project version files, commits the change, creates the Git tag,
  and checks the deployment pipeline status.
---

# Release Version

Use this skill to create a repository release version.

## Files to update

Keep these files synchronized to the same SemVer value, without the leading
`v`:

- `packages/dashboard/package.json`
- `packages/dashboard/package-lock.json`
- `packages/dashboard/pyproject.toml`
- `packages/pipeline/pyproject.toml`

The Git tag must use the leading `v`, for example `v1.2.3`.

## Workflow

1. Check the worktree before changing anything:

```bash
git status --short --branch
```

If there are unrelated local changes, do not overwrite them. Work only on the
version files, or ask the user if the release cannot be made safely.

2. Retrieve the latest released version from Git tags:

```bash
git fetch --tags --quiet
git tag --list 'v[0-9]*' --sort=-version:refname | head -1
```

If no tag exists, inspect the version files and use the highest SemVer value as
the current version. If no version can be found, start from `0.0.0`.

3. Ask the user which bump type to create:

- `major`: `X.0.0`
- `minor`: `x.Y.0`
- `patch`: `x.y.Z`

Show the current version and the resulting target version before editing. If
the user already provided an explicit target like `v1.0.0`, use it directly and
skip the bump-type question.

4. Update the files listed above:

- JSON files: update only the package's own `version` fields.
  In `package-lock.json`, this is the top-level `version` and
  `packages[""].version`.
- TOML files: update `[project].version`.
- Use the bare version string, for example `1.2.3`, not `v1.2.3`.

5. Verify the result:

```bash
rg -n 'version\\s*=\\s*"|"version"\\s*:' \
  packages/dashboard/package.json \
  packages/dashboard/package-lock.json \
  packages/dashboard/pyproject.toml \
  packages/pipeline/pyproject.toml

git diff -- \
  packages/dashboard/package.json \
  packages/dashboard/package-lock.json \
  packages/dashboard/pyproject.toml \
  packages/pipeline/pyproject.toml
```

The diff should contain only version changes.

6. Create the release commit and tag:

```bash
git add \
  packages/dashboard/package.json \
  packages/dashboard/package-lock.json \
  packages/dashboard/pyproject.toml \
  packages/pipeline/pyproject.toml

git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
```

Before tagging, confirm the tag does not already exist:

```bash
git rev-parse --verify --quiet refs/tags/vX.Y.Z
```

If the tag exists, stop and tell the user.

7. Final local check:

```bash
git status --short --branch
git describe --tags --exact-match HEAD
git show --stat --oneline --decorate --no-renames HEAD
```

8. Check the deployment pipeline.

This repository uses GitHub Actions:

- `.github/workflows/ci.yml`: runs on pushes and pull requests to `main`.
- `.github/workflows/deploy-pages.yml`: deploys the demo on pushes to `main`.
- `.github/workflows/release.yml`: builds standalone executables and creates a
  GitHub Release on pushed tags matching `v*`.

If the release commit/tag has not been pushed yet, explain that the deployment
pipeline cannot start until the user pushes the branch and tag. Do not push
unless the user asks for it. The expected push is:

```bash
git push origin HEAD
git push origin vX.Y.Z
```

If GitHub CLI is installed and authenticated, check recent workflow runs:

```bash
gh run list --limit 10
gh run list --workflow ci.yml --limit 5
gh run list --workflow deploy-pages.yml --limit 5
gh run list --workflow release.yml --limit 5
```

After the tag is pushed, check the release workflow for the tag:

```bash
gh run list --workflow release.yml --branch vX.Y.Z --limit 5
```

If a relevant run is in progress, report that status and give the run URL:

```bash
gh run view <run-id> --web
```

If a relevant run failed, inspect the failure before reporting:

```bash
gh run view <run-id> --log-failed
```

If `gh` is not available or not authenticated, report the local release result
and tell the user to verify the three workflows in the repository's GitHub
Actions tab after pushing.

Report the new version, commit hash, tag name, whether the branch is ahead of
the remote, whether the tag has been pushed, and the latest known status of the
CI, Pages deployment, and Release workflows.
