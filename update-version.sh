#!/usr/bin/env bash

# Script to update version automatically
# Usage: npm run version:update <new-version>

VERSION_FILE="version.json"

if [ $# -eq 0 ]; then
  echo "Error: New version number required"
  echo "Usage: npm run version:update <new-version>"
  exit 1
fi

NEW_VERSION=$1

# Update version.json
if [ -f "$VERSION_FILE" ]; then
  # Use jq to update the version field
  jq --arg version "$NEW_VERSION" '.version = $version | .lastUpdated = (now | strftime("%Y-%m-%d"))' "$VERSION_FILE" > "${VERSION_FILE}.tmp" && mv "${VERSION_FILE}.tmp" "$VERSION_FILE"
  echo "Updated version to $NEW_VERSION in $VERSION_FILE"
else
  echo "Error: $VERSION_FILE not found"
  exit 1
fi

# Update package.json files
for package in package.json frontend/package.json backend/package.json shared/package.json; do
  if [ -f "$package" ]; then
    jq --arg version "$NEW_VERSION" '.version = $version' "$package" > "${package}.tmp" && mv "${package}.tmp" "$package"
    echo "Updated version to $NEW_VERSION in $package"
  fi
done

# Build the project
npm run build

echo "Version update complete. Build completed successfully."