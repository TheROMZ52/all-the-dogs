from __future__ import annotations

import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import build


class BuilderTests(unittest.TestCase):
    def test_rejects_non_https_url(self):
        with self.assertRaises(ValueError):
            build.validate_url("http://example.com/source.zip")

    def test_rejects_url_credentials(self):
        with self.assertRaises(ValueError):
            build.validate_url("https://user:pass@example.com/source.zip")

    def test_extracts_regular_zip(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            archive = root / "source.zip"
            destination = root / "out"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("project/package.json", '{"name":"sample"}')
            build.safe_extract(archive, destination)
            self.assertEqual((destination / "project/package.json").read_text(), '{"name":"sample"}')

    def test_rejects_path_traversal(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            archive = root / "unsafe.zip"
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr("../escape.txt", "nope")
            with self.assertRaises(ValueError):
                build.safe_extract(archive, root / "out")
            self.assertFalse((root / "escape.txt").exists())

    def test_rejects_symlinks(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            archive = root / "link.zip"
            info = zipfile.ZipInfo("project/link")
            info.create_system = 3
            info.external_attr = (0o120777 << 16)
            with zipfile.ZipFile(archive, "w") as zf:
                zf.writestr(info, "target")
            with self.assertRaises(ValueError):
                build.safe_extract(archive, root / "out")

    def test_detects_node_project(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "package.json").write_text('{"name":"sample"}')
            self.assertEqual(build.detect(root), "node")

    def test_detects_python_project(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "main.py").write_text("print('hi')")
            self.assertEqual(build.detect(root), "python")

    def test_detects_maven_project(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "pom.xml").write_text("<project/>")
            self.assertEqual(build.detect(root), "java")

    def test_detects_android_project(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "settings.gradle").write_text("rootProject.name = 'sample'")
            (root / "app").mkdir()
            (root / "app/build.gradle").write_text("plugins { id 'com.android.application' }")
            (root / "app/src/main").mkdir(parents=True)
            (root / "app/src/main/AndroidManifest.xml").write_text("<manifest/>")
            self.assertEqual(build.detect(root), "android")


if __name__ == "__main__":
    unittest.main()
