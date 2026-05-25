#!/usr/bin/env python3
"""Render ebook HTMLs to PDFs using WeasyPrint."""
import os
import sys
from pathlib import Path

from weasyprint import HTML

SRC = Path("/home/user/MMN_AI-to-AI/frontend/public/ebooks")
DST = SRC / "pdf"
DST.mkdir(parents=True, exist_ok=True)

errors = []
for html_file in sorted(SRC.glob("*.html")):
    pdf_file = DST / (html_file.stem + ".pdf")
    print(f"-> {html_file.name}  =>  {pdf_file.name}")
    try:
        HTML(filename=str(html_file)).write_pdf(str(pdf_file))
    except Exception as exc:  # noqa: BLE001
        errors.append((html_file.name, str(exc)))
        print(f"   FAILED: {exc}")

print("\nDone.")
if errors:
    print("ERRORS:")
    for name, msg in errors:
        print(f"  - {name}: {msg}")
    sys.exit(1)
