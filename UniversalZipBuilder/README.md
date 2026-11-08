# Universal ZIP Builder

A GitHub Actions based build runner for source projects packaged as ZIP files.

## Supported project types

- Android (Gradle: APK/AAB)
- Java (Maven or Gradle: JAR/WAR)
- Node.js (npm build output)
- Python (compile check and wheel/source ZIP)

## v0.2 web console

The browser console is in `UniversalZipBuilder/web/index.html`. It can dispatch the GitHub Actions workflow, read recent runs, and link to build logs.

To use the console:

1. Enable GitHub Pages for this repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Run the **Publish Universal ZIP Builder Console** workflow, or push a change under `UniversalZipBuilder/web/`.
3. Open the Pages URL shown in the deployment job.
4. Create a fine-grained personal access token scoped only to this repository, with **Actions: Read and write**.
5. Paste the token into the console, paste a direct HTTPS ZIP URL, select a project type, and start the build.

The console keeps the token in page memory only. It does not write the token to localStorage or send it to a third-party service; requests go directly from the browser to api.github.com. Clear the token or close the tab when finished.

## Current upload mode

This version accepts a **direct HTTPS download URL**. Direct file upload from the browser is not enabled yet. A private temporary object-storage endpoint is required for that feature; this repository does not publish uploaded source archives to its public Git history or Releases.

The source URL must be reachable by a GitHub-hosted runner without interactive authentication. Do not use a URL containing passwords, access tokens, or other secrets: workflow inputs are sent to GitHub and may be visible to repository users with Actions access. Private-source uploads need a private storage integration in a future version.

## Build outputs

Artifacts are uploaded as `universal-build-output` and retained for 7 days. Open the workflow run in GitHub to inspect logs and download the artifact.

## Build and security boundaries

- Builds run on disposable GitHub-hosted runners.
- The workflow grants only read access to repository contents.
- Checkout credentials are not persisted in Git configuration.
- ZIP extraction rejects path traversal, symlinks, oversized archives, and excessive entry counts.
- Downloads are HTTPS-only, limited to 500 MiB, and reject non-public destination addresses and unsafe redirects.
- Build scripts and dependency installation from an uploaded project are untrusted code. The workflow does not intentionally provide repository secrets to the build process.
- Do not use this service for projects that require private credentials or production secrets.

## Run without the web console

1. Open the repository's **Actions** tab.
2. Select **Universal ZIP Builder**.
3. Click **Run workflow**.
4. Paste a direct HTTPS URL to the source ZIP.
5. Choose **Auto Detect** or force a project type.
6. Download the artifact after the run completes.

## Tests

The workflow runs the safety and project-detection tests before processing a ZIP:

```bash
python -m unittest discover -s UniversalZipBuilder/tests -v
```
