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

# check if the package.json file exists
if [ ! -f package.json ]; then
  echo "package.json not found." >&2
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

# switch to the dev branch if it exists
# else create a new branch
git checkout dev || git checkout -b dev main

# update the change log
git-cliff -t "v$new_version" -o CHANGELOG.md
git add CHANGELOG.md

# update the version in package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$new_version\"/" package.json
git add package.json

# commit the changes
git commit --no-verify -m "Release v$new_version 🚀"

# add a new tag
git tag -a "v$new_version" -m "v$new_version"
git push -u origin HEAD --tags || exit $?

# Pr to main
pr_title="Release v$new_version 🚀"
pr_body=$(git-cliff --latest -s all)
gh pr create -B main -H dev -t "$pr_title" -b "$pr_body"

# go back to the previous branch
git checkout $previous_branch
