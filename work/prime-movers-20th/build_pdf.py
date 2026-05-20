#!/usr/bin/env python3
"""Render Prime Movers mockups to print-ready PDFs via WeasyPrint.

Usage:
    ./build_pdf.py                # render every mockup
    ./build_pdf.py pre-packet     # render only pre-packet.html -> pre-packet.pdf
    ./build_pdf.py program        # render only program.html    -> program.pdf

Output PDFs land alongside the source HTML inside mockups/, so the
"Download PDF" button in each mockup can use a same-directory href
(href="pre-packet.pdf"). That keeps the link working in both the local
mockup folder AND the share/work/<project>/ mirror, since
scripts/build-work.mjs copies the mockups/ tree verbatim.

The script self-bootstraps a local .venv-pdf next to itself the first time
it runs, so you do not need to install WeasyPrint by hand. The venv is
git-ignored.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
MOCKUPS_DIR = SCRIPT_DIR / "mockups"
VENV_DIR = SCRIPT_DIR / ".venv-pdf"
VENV_PY = VENV_DIR / "bin" / "python"

DOCS: dict[str, Path] = {
    "pre-packet": MOCKUPS_DIR / "pre-packet.html",
    "program":    MOCKUPS_DIR / "program.html",
}


def in_project_venv() -> bool:
    """True if the current interpreter is the project's .venv-pdf python."""
    try:
        return Path(sys.executable).resolve() == VENV_PY.resolve()
    except FileNotFoundError:
        return False


def ensure_venv_and_reexec() -> None:
    """Create .venv-pdf (if missing), install WeasyPrint (if missing), then
    re-launch this script using the venv's python so subsequent imports work.

    Uses subprocess with list-form arguments (no shell) and os.execv (the
    POSIX exec syscall, not a shell exec) - safe from injection.
    """
    if in_project_venv():
        return

    if not VENV_PY.exists():
        print("[build_pdf] First-run setup: creating .venv-pdf ...")
        subprocess.run(
            [sys.executable, "-m", "venv", str(VENV_DIR)],
            check=True,
        )

    # Is weasyprint available in the venv?
    probe = subprocess.run(
        [str(VENV_PY), "-c", "import weasyprint"],
        capture_output=True,
    )
    if probe.returncode != 0:
        print("[build_pdf] Installing WeasyPrint into .venv-pdf ...")
        subprocess.run(
            [str(VENV_PY), "-m", "pip", "install", "--quiet", "--upgrade", "pip"],
            check=True,
        )
        subprocess.run(
            [str(VENV_PY), "-m", "pip", "install", "--quiet", "weasyprint"],
            check=True,
        )

    # Re-launch this script using the venv's python (os.execv replaces the
    # current process with the venv interpreter; no shell involved).
    os.execv(str(VENV_PY), [str(VENV_PY), __file__, *sys.argv[1:]])


def render(name: str) -> None:
    """Render one mockup HTML to a sibling PDF inside mockups/."""
    import weasyprint  # type: ignore[import-not-found]

    src = DOCS[name]
    out = MOCKUPS_DIR / f"{name}.pdf"
    if not src.exists():
        raise SystemExit(f"[build_pdf] Missing source: {src}")

    print(f"[build_pdf] {src.name} -> {out.name}")
    weasyprint.HTML(
        filename=str(src),
        base_url=str(src.parent),
    ).write_pdf(target=str(out))
    rel = out.relative_to(SCRIPT_DIR.parent.parent)
    print(f"[build_pdf]   wrote {rel} ({out.stat().st_size:,} bytes)")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "doc",
        nargs="?",
        choices=list(DOCS),
        default=None,
        help="Render only this mockup. Omit to render all.",
    )
    args = parser.parse_args()

    ensure_venv_and_reexec()
    # Past this line we are guaranteed to be running inside .venv-pdf
    # (ensure_venv_and_reexec() replaces the process if we were not).

    targets = [args.doc] if args.doc else list(DOCS)
    for name in targets:
        render(name)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
