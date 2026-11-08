# Universal ZIP Builder

A GitHub Actions based build runner for source projects packaged as ZIP files.

## Supported project types

- Android (Gradle: APK/AAB)
- Java (Maven or Gradle: JAR/WAR)
- Node.js (npm build; packaged output is collected when available)
- Python (compile check and wheel build when pyproject.toml is present)

## Current v0.1 workflow

The workflow is started from **Actions → Universal ZIP Builder → Run workflow**. Supply an HTTPS URL to the source ZIP and select a project type, or use Auto Detect.

The source ZIP is downloaded only inside an ephemeral GitHub-hosted runner. It is not committed to this repository. The workflow grants read-only repository permissions and does not expose repository secrets to the build process.

> The first version accepts an HTTPS download URL rather than a browser file upload. A direct-upload web interface needs a separate authenticated upload endpoint; putting a GitHub token in browser JavaScript would expose it.

## Build outputs

Artifacts are uploaded as `universal-build-output` and retained for 7 days. Build logs remain available in the GitHub Actions run.

## Safety boundaries

- ZIP extraction rejects path traversal and symlinks.
- Download is limited to 500 MiB and HTTPS only.
- Builds run in a disposable GitHub-hosted runner.
- The workflow does not check out or execute any project from this repository beyond the builder itself.
- Build scripts inside an uploaded project are untrusted code. Do not add credentials or secrets to this workflow.

## Run it

1. Open the repository's **Actions** tab.
2. Select **Universal ZIP Builder**.
3. Click **Run workflow**.
4. Paste a direct HTTPS URL to the ZIP.
5. Choose **Auto Detect** or force a project type.
6. Download the artifact after the run completes.
