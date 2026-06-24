"""Hatchling build hook: builds the Vite frontend before packaging.

Without this, `pipx install git+...#subdirectory=packages/dashboard` fails
on a fresh checkout because dist/ (force-included into the wheel) is a
gitignored build artifact that doesn't exist until `npm run build` runs.
This hook runs that build automatically, so the git-URL install works as a
single command. A pre-existing dist/ (e.g. a local dev checkout that was
already built) is left untouched.
"""

import shutil
import subprocess
from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class DashboardBuildHook(BuildHookInterface):
    def initialize(self, version, build_data):
        dist_dir = Path(self.root) / "dist"
        if dist_dir.is_dir():
            return

        npm = shutil.which("npm")
        if npm is None:
            raise RuntimeError(
                "Building finance-dashboard requires Node.js/npm (to "
                "compile the frontend) but `npm` was not found on PATH. "
                "Install Node.js, or build it yourself first: "
                "`cd packages/dashboard && npm ci && npm run build`, then "
                "retry the install."
            )

        subprocess.run([npm, "ci"], cwd=self.root, check=True)
        subprocess.run([npm, "run", "build"], cwd=self.root, check=True)
