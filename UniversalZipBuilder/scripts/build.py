from __future__ import annotations

import argparse
import ipaddress
import os
import shutil
import socket
import subprocess
import sys
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path, PurePosixPath

MAX_DOWNLOAD = 500 * 1024 * 1024
MAX_EXTRACTED = 1024 * 1024 * 1024
MAX_FILES = 20000
BUILD_TIMEOUT = 30 * 60
ROOT = Path.cwd()
WORK = ROOT / "work"
SOURCE = WORK / "source"
OUTPUT = ROOT / "build-output"


def validate_url(value: str) -> str:
    parsed = urllib.parse.urlparse(value)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("Source URL must be a valid HTTPS URL.")
    if parsed.username or parsed.password:
        raise ValueError("Credentials embedded in source URLs are not allowed.")
    if parsed.port not in (None, 443):
        raise ValueError("Only the standard HTTPS port is allowed.")
    host = parsed.hostname.rstrip(".").lower()
    if host == "localhost" or host.endswith((".localhost", ".local")):
        raise ValueError("Local network hosts are not allowed.")
    try:
        addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError as exc:
        raise ValueError(f"Could not resolve source host: {exc}") from exc
    if not addresses:
        raise ValueError("Source host did not resolve.")
    for item in addresses:
        if not ipaddress.ip_address(item[4][0]).is_global:
            raise ValueError("Private, loopback, and reserved IP addresses are not allowed.")
    return value


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def download_zip(url: str, destination: Path) -> None:
    opener = urllib.request.build_opener(SafeRedirectHandler)
    request = urllib.request.Request(validate_url(url), headers={"User-Agent": "UniversalZipBuilder/0.2"})
    with opener.open(request, timeout=45) as response, destination.open("wb") as out:
        total = 0
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_DOWNLOAD:
                raise ValueError("ZIP exceeds the 500 MiB download limit.")
            out.write(chunk)


def safe_extract(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    destination_resolved = destination.resolve()
    with zipfile.ZipFile(archive) as zf:
        infos = zf.infolist()
        if len(infos) > MAX_FILES:
            raise ValueError("ZIP contains too many entries.")
        declared_total = sum(info.file_size for info in infos)
        if declared_total > MAX_EXTRACTED:
            raise ValueError("Expanded ZIP exceeds the 1 GiB extraction limit.")
        actual_total = 0
        for info in infos:
            name = info.filename.replace("\\", "/")
            path = PurePosixPath(name)
            mode = info.external_attr >> 16
            if path.is_absolute() or not path.parts or any(part in {"..", ""} for part in path.parts):
                raise ValueError(f"Unsafe ZIP entry: {name}")
            if path.parts[0].endswith(":"):
                raise ValueError(f"Drive-qualified ZIP entry is not allowed: {name}")
            if mode & 0o170000 == 0o120000:
                raise ValueError(f"Symlinks are not allowed in ZIP files: {name}")
            target = (destination_resolved / Path(*path.parts)).resolve()
            if destination_resolved not in target.parents and target != destination_resolved:
                raise ValueError(f"ZIP entry escapes extraction directory: {name}")
            if info.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            extracted = 0
            with zf.open(info) as src, target.open("wb") as dst:
                while True:
                    chunk = src.read(1024 * 1024)
                    if not chunk:
                        break
                    extracted += len(chunk)
                    actual_total += len(chunk)
                    if extracted > info.file_size or actual_total > MAX_EXTRACTED:
                        raise ValueError("ZIP expanded beyond its declared or allowed size.")
                    dst.write(chunk)
            if extracted != info.file_size:
                raise zipfile.BadZipFile(f"Unexpected uncompressed size for {name}")


def project_root() -> Path:
    entries = [p for p in SOURCE.iterdir() if p.name not in {"__MACOSX", ".DS_Store"}]
    if len(entries) == 1 and entries[0].is_dir():
        return entries[0]
    return SOURCE


def detect(root: Path) -> str:
    gradle_files = list(root.glob("*.gradle")) + list(root.glob("*.gradle.kts"))
    is_android = any(root.rglob("AndroidManifest.xml"))
    for build_file in gradle_files:
        try:
            if "com.android.application" in build_file.read_text(encoding="utf-8", errors="ignore") or "com.android.library" in build_file.read_text(encoding="utf-8", errors="ignore"):
                is_android = True
        except OSError:
            pass
    if is_android and (gradle_files or any(root.rglob("settings.gradle*"))):
        return "android"
    if gradle_files or any(root.glob("settings.gradle*")) or (root / "pom.xml").exists() or any(root.rglob("pom.xml")):
        return "java"
    if (root / "package.json").exists():
        return "node"
    if (root / "pyproject.toml").exists() or (root / "requirements.txt").exists() or any(root.glob("*.py")):
        return "python"
    raise ValueError("Could not identify project. Select a type manually or include a standard build file.")


def run(command: list[str], cwd: Path) -> None:
    print("$ " + " ".join(command), flush=True)
    subprocess.run(command, cwd=cwd, check=True, timeout=BUILD_TIMEOUT)


def copy_matches(root: Path, patterns: tuple[str, ...]) -> int:
    count = 0
    for pattern in patterns:
        for source in root.rglob(pattern):
            if source.is_symlink() or not source.is_file() or any(part in {"node_modules", ".git", ".gradle"} for part in source.parts):
                continue
            relative = source.relative_to(root)
            target = OUTPUT / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            count += 1
    return count


def build_android(root: Path) -> None:
    wrapper = root / ("gradlew.bat" if os.name == "nt" else "gradlew")
    if wrapper.exists():
        if os.name != "nt":
            wrapper.chmod(wrapper.stat().st_mode | 0o111)
        command = [str(wrapper)]
    else:
        command = ["gradle"]
    run(command + ["assembleDebug"], root)
    copy_matches(root, ("*.apk", "*.aab"))


def build_java(root: Path) -> None:
    if (root / "pom.xml").exists():
        wrapper = root / ("mvnw.cmd" if os.name == "nt" else "mvnw")
        command = [str(wrapper)] if wrapper.exists() else ["mvn"]
        if wrapper.exists() and os.name != "nt":
            wrapper.chmod(wrapper.stat().st_mode | 0o111)
        run(command + ["-B", "package", "-DskipTests"], root)
    else:
        wrapper = root / ("gradlew.bat" if os.name == "nt" else "gradlew")
        command = [str(wrapper)] if wrapper.exists() else ["gradle"]
        if wrapper.exists() and os.name != "nt":
            wrapper.chmod(wrapper.stat().st_mode | 0o111)
        run(command + ["build", "-x", "test"], root)
    copy_matches(root, ("*.jar", "*.war"))


def build_node(root: Path) -> None:
    if not (root / "package.json").exists():
        raise ValueError("Node.js project is missing package.json.")
    if (root / "package-lock.json").exists():
        run(["npm", "ci", "--no-audit", "--no-fund"], root)
    else:
        run(["npm", "install", "--no-audit", "--no-fund"], root)
    run(["npm", "run", "build", "--if-present"], root)
    for folder in ("dist", "build", ".next/standalone", ".next/static"):
        source = root / folder
        if source.exists() and source.is_dir():
            target = OUTPUT / folder.replace("/", "_")
            shutil.copytree(source, target, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", ".git"))


def build_python(root: Path) -> None:
    run([sys.executable, "-m", "compileall", "-q", "."], root)
    if (root / "pyproject.toml").exists():
        run([sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "build"], root)
        run([sys.executable, "-m", "build", "--outdir", str(OUTPUT)], root)
    else:
        if (root / "requirements.txt").exists():
            run([sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "-r", "requirements.txt"], root)
        shutil.make_archive(str(OUTPUT / "python-source"), "zip", root)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--type", choices=("auto", "android", "java", "node", "python"), default="auto")
    args = parser.parse_args()

    shutil.rmtree(WORK, ignore_errors=True)
    shutil.rmtree(OUTPUT, ignore_errors=True)
    WORK.mkdir(parents=True)
    OUTPUT.mkdir(parents=True)

    try:
        archive = WORK / "source.zip"
        download_zip(args.url, archive)
        if not zipfile.is_zipfile(archive):
            raise ValueError("The provided URL did not return a valid ZIP archive.")
        safe_extract(archive, SOURCE)
        root = project_root()
        project_type = detect(root) if args.type == "auto" else args.type
        print(f"Detected build type: {project_type}", flush=True)
        {"android": build_android, "java": build_java, "node": build_node, "python": build_python}[project_type](root)
        (OUTPUT / "BUILD_INFO.txt").write_text(
            f"Build type: {project_type}\nSource archive: {urllib.parse.urlparse(args.url).path.rsplit('/', 1)[-1]}\n",
            encoding="utf-8",
        )
        if not any(OUTPUT.iterdir()):
            raise ValueError("Build completed but no output files were collected.")
        print(f"Build succeeded. Output files: {sum(1 for p in OUTPUT.rglob('*') if p.is_file())}", flush=True)
        return 0
    except Exception as exc:
        print(f"BUILD FAILED: {exc}", file=sys.stderr, flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
