"""Human-readable chapter, lesson and download names without moving stored files."""
from __future__ import annotations

import re
import unicodedata


def _without_number(name: str | None, label: str) -> str:
    value = unicodedata.normalize("NFC", str(name or "")).strip()
    labelled = re.compile(rf"^{re.escape(label)}\s+\d+(?:\.\d+)*\s*[:.\-–—]?\s*", re.IGNORECASE)
    numeric = re.compile(r"^\d+(?:\.\d+)*\s*[:.\-–—]\s*")
    while value:
        clean = numeric.sub("", labelled.sub("", value, count=1), count=1).strip()
        if clean == value:
            return value
        value = clean
    return ""


def numbered_title(name: str | None, label: str, number: int) -> str:
    """Replace an old numeric prefix; repeated normalization is idempotent."""
    number = max(1, int(number))
    content = _without_number(name, label)
    return f"{label} {number}" + (f": {content}" if content else "")


def safe_filename(stem: str, extension: str = ".pdf") -> str:
    """Keep Vietnamese text while removing path separators and unsafe filename chars."""
    extension = "." + re.sub(r"[^a-zA-Z0-9]", "", extension).lower() if extension else ""
    value = unicodedata.normalize("NFC", str(stem))
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f\x7f]', " - ", value)
    value = re.sub(r"\s+", " ", value).strip(" .-") or "Tai lieu"
    if re.fullmatch(r"CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]", value, re.IGNORECASE):
        value = "Tai lieu " + value
    # 240 UTF-8 bytes remains usable on filesystems with a 255-byte component limit.
    budget = max(1, 240 - len(extension.encode("utf-8")))
    value = value.encode("utf-8")[:budget].decode("utf-8", errors="ignore").rstrip(" .-")
    return value + extension


def lesson_document_name(
    chapter_name: str | None,
    lesson_title: str | None,
    chapter_number: int,
    lesson_number: int,
    extension: str = ".pdf",
) -> str:
    """Name an attachment by its curriculum position and retained lesson subject."""
    chapter = numbered_title(chapter_name, "Chương", chapter_number).split(":", 1)[0]
    lesson = numbered_title(lesson_title, "Bài", lesson_number).replace(": ", " - ", 1)
    return safe_filename(f"{chapter} - {lesson}", extension)
