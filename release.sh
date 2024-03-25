#!/usr/bin/env bash

# This script is used to release a new version of the project.
# It will update the version number, commit the changes, create a tag, and push to the remote repository.

# exit if any command fails
set -e

if [ -z "$(command -v git-cliff)" ]; then
  echo "git-cliff is not installed." >&2
  exit 1
fi

if [ -z "$(command -v gh)" ]; then
  echo "gh is not installed." >&2
  exit 1
fi

# check if the manifest.json file exists
if [ ! -f public/manifest.json ]; then
  echo "manifest.json not found." >&2
  exit 1
fi

# find all commits from the last tag to the current HEAD
last_tag=$(git describe --tags --abbrev=0 2> /dev/null)
if [ -z "$last_tag" ]; then
  echo "No tags found." >&2
  exit 1
fi
new_version=$(git-cliff --bumped-version)
# strip the 'v' from the version
new_version=${new_version//v}
commit_count=$(git rev-list $last_tag..HEAD --count)

if [ $commit_count -eq 0 ]; then
  echo "No new commits since last tag." >&2
  exit 1
fi
echo "Releasing version $new_version"

# save the current branch
previous_branch=$(git rev-parse --abbrev-ref HEAD)
git checkout -b dev

# add a new tag
git tag -a "v$new_version" -m "v$new_version"

# update the change log
git-cliff -o CHANGELOG.md
git add CHANGELOG.md

# update the version in the manifest.json
sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" public/manifest.json
git add public/manifest.json

# commit the changes
git commit --no-verify -m "Release v$new_version 🚀"
git push -u origin HEAD --tags || exit $?

# Pr to main
pr_title="Release v$new_version 🚀"
pr_body=$(git-cliff --current -s all)
gh pr create -B main -H dev -t "$pr_title" -b "$pr_body"

# go back to the previous branch
git checkout $previous_branch
