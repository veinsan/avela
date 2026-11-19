"""Markdown to PDF for the submission files (README.pdf, testing report). Usage, from the repository root:

  uv run --no-project --with markdown==3.9 --with xhtml2pdf==0.2.17 python scripts/md2pdf.py <in.md> <out.pdf> "<title>"
"""
import sys
from pathlib import Path

import markdown
from xhtml2pdf import pisa

CSS = """
@page { size: A4; margin: 18mm 16mm; @frame footer { -pdf-frame-content: footer; bottom: 8mm; margin-left: 16mm; height: 8mm; } }
body { font-family: Helvetica; font-size: 9.5pt; line-height: 1.35; color: #1C302A; }
h1 { font-size: 18pt; color: #166B5E; margin: 0 0 6pt 0; }
h2 { font-size: 13pt; color: #166B5E; margin: 12pt 0 4pt 0; border-bottom: 0.5pt solid #D7DFD7; }
h3 { font-size: 11pt; margin: 8pt 0 3pt 0; }
table { border-collapse: collapse; width: 100%; margin: 4pt 0 8pt 0; }
th, td { border: 0.5pt solid #A9B8AF; padding: 3pt 4pt; vertical-align: top; font-size: 8.5pt; }
th { background-color: #EDF1E9; }
code { font-family: Courier; font-size: 8.5pt; }
pre { font-family: Courier; font-size: 7.5pt; background-color: #F7F8F3; border: 0.5pt solid #D7DFD7; padding: 4pt; }
"""

src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
body = markdown.markdown(Path(src).read_text(encoding="utf-8"), extensions=["tables", "fenced_code"])
html = (f"<html><head><meta charset='utf-8'><title>{title}</title><style>{CSS}</style></head><body>{body}"
        f"<div id='footer' style='font-size:7.5pt;color:#52645C'>{title} · page <pdf:pagenumber></div></body></html>")
with open(out, "wb") as f:
    result = pisa.CreatePDF(html, dest=f, encoding="utf-8")
sys.exit(1 if result.err else 0)
