"""Audit local materials and normalize chapter, lesson and document names.

Run from backend (preview is the default):
  .venv/Scripts/python.exe scripts/normalize_material_names.py
  .venv/Scripts/python.exe scripts/normalize_material_names.py --apply

Names use the same order_index/id ordering as the course outline. Lesson numbers
restart in each chapter. File bytes and indexed chunks are retained. A JSON
ledger contains old/new values before any database update.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from sqlalchemy import text

from app.ai.rag.document_loader import extract
from app.core.config import settings
from app.core.database import engine
from app.core.media import resolve_upload_path
from app.services.material_names import numbered_title, safe_filename


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, default=str), encoding="utf-8")


def inventory(conn):
    courses = [dict(r) for r in conn.execute(text("SELECT id,title FROM courses ORDER BY id")).mappings()]
    excluded = [c for c in courses if c["title"].upper().startswith("PYTEST")]
    courses = [c for c in courses if c not in excluded]
    ids = {c["id"] for c in courses}
    chapters = [dict(r) for r in conn.execute(text(
        "SELECT id,course_id,chapter_name,order_index FROM chapters ORDER BY course_id,order_index,id"
    )).mappings() if r["course_id"] in ids]
    chapter_ids = {c["id"] for c in chapters}
    lessons = [dict(r) for r in conn.execute(text(
        "SELECT id,chapter_id,title,order_index,document_url FROM lessons ORDER BY chapter_id,order_index,id"
    )).mappings() if r["chapter_id"] in chapter_ids]
    documents = [dict(r) for r in conn.execute(text(
        "SELECT id,course_id,lesson_id,title,filename,file_path,file_type,status,chunk_count FROM documents ORDER BY id"
    )).mappings() if r["course_id"] in ids]
    return courses, chapters, lessons, documents, excluded


def plan_names(courses, chapters, lessons, documents):
    changes = []
    copies = []
    course_titles = {c["id"]: c["title"] for c in courses}
    chapter_numbers = {}
    chapter_courses = {ch["id"]: ch["course_id"] for ch in chapters}
    lesson_courses = {l["id"]: chapter_courses[l["chapter_id"]] for l in lessons}
    counters = defaultdict(int)
    lesson_numbers = {}
    for chapter in chapters:
        counters[chapter["course_id"]] += 1
        number = counters[chapter["course_id"]]
        chapter_numbers[chapter["id"]] = number
        title = numbered_title(chapter["chapter_name"], "Chương", number)
        if title != chapter["chapter_name"]:
            changes.append(dict(table="chapters", id=chapter["id"], before={"chapter_name": chapter["chapter_name"]}, after={"chapter_name": title}))
    counters.clear()
    for lesson in lessons:
        counters[lesson["chapter_id"]] += 1
        number = counters[lesson["chapter_id"]]
        lesson_numbers[lesson["id"]] = (chapter_numbers[lesson["chapter_id"]], number)
        title = numbered_title(lesson["title"], "Bài", number)
        if title != lesson["title"]:
            changes.append(dict(table="lessons", id=lesson["id"], before={"title": lesson["title"]}, after={"title": title}))
    root = Path(settings.upload_dir, "documents").resolve()
    for doc in documents:
        if doc["lesson_id"] is not None:
            if doc["lesson_id"] not in lesson_numbers or lesson_courses[doc["lesson_id"]] != doc["course_id"]:
                raise ValueError(f"Document {doc['id']} references a lesson outside its course outline")
            chapter_no, lesson_no = lesson_numbers[doc["lesson_id"]]
            # Retain the document's specific subject and supplement suffix.
            base = re.sub(r"^Chương\s+\d+\s*[—–:.-]\s*", "", doc["title"], flags=re.I)
            title = f"Chương {chapter_no} — {numbered_title(base, 'Bài', lesson_no)}"
        else:
            course_title = course_titles[doc["course_id"]]
            if doc["title"].endswith(" — Tài liệu tổng hợp"):
                title = f"{course_title} — Tài liệu tổng hợp"
            else:
                title = doc["title"] if doc["title"].startswith(course_title + " — ") else f"{course_title} — {doc['title']}"
        if len(title) > 255:
            raise ValueError(f"Document title too long: {doc['id']}")
        after = {"title": title, "filename": safe_filename(title, "." + doc["file_type"])}
        source = Path(doc["file_path"]).resolve()
        if not source.is_relative_to(root):
            # The source viewer serves only uploads/documents. Preserve the source
            # and copy these older course-level files into its protected store.
            digest = hashlib.sha256(source.read_bytes()).hexdigest()
            destination = root / f"course_material_{doc['id']}_{digest[:12]}.{doc['file_type']}"
            after["file_path"] = str(destination)
            copies.append(dict(source=str(source), destination=str(destination), sha256=digest))
        before = {key: doc[key] for key in after}
        if before != after:
            changes.append(dict(table="documents", id=doc["id"], before=before, after=after))
    return changes, copies


def audit_files(lessons, documents):
    cache = {}
    def inspect(raw_path, file_type):
        if not raw_path:
            return {"ok": False, "error": "Missing or non-local document URL"}
        path = Path(raw_path).resolve()
        if str(path) not in cache:
            item = {"path": str(path), "ok": False}
            try:
                data = path.read_bytes()
                pages, count = extract(str(path), file_type)
                chars = sum(len(value.strip()) for _, value in pages)
                item.update(sha256=hashlib.sha256(data).hexdigest(), bytes=len(data), pages=count, text_chars=chars,
                            ok=chars > 0)
                if not chars:
                    item["error"] = "No readable text"
            except Exception as exc:
                item["error"] = str(exc)
            cache[str(path)] = item
        return cache[str(path)]
    lesson_checks = [dict(lesson_id=l["id"], **inspect(resolve_upload_path(l["document_url"]), "pdf")) for l in lessons]
    document_checks = [dict(document_id=d["id"], **inspect(d["file_path"], d["file_type"])) for d in documents]
    return dict(lessons=lesson_checks, documents=document_checks, unique_files=len(cache),
                errors=sum(not r["ok"] for r in lesson_checks + document_checks))


def counts(conn):
    return {table: conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            for table in ("courses", "chapters", "lessons", "documents", "document_chunks", "quizzes", "questions", "results", "result_answers", "lesson_progress", "enrollments")}


def apply_changes(changes, copies):
    for entry in copies:
        source, destination = Path(entry["source"]), Path(entry["destination"])
        if hashlib.sha256(source.read_bytes()).hexdigest() != entry["sha256"]:
            raise RuntimeError("Source changed after audit")
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists():
            if hashlib.sha256(destination.read_bytes()).hexdigest() != entry["sha256"]:
                raise RuntimeError("Destination exists with different content")
        else:
            shutil.copyfile(source, destination)
    with engine.begin() as conn:
        original_counts = counts(conn)
        for change in changes:
            table = change["table"]
            fields = list(change["after"])
            current = conn.execute(text(f"SELECT {','.join(fields)} FROM {table} WHERE id=:id FOR UPDATE"), {"id": change["id"]}).mappings().one()
            if dict(current) != change["before"]:
                raise RuntimeError(f"{table} #{change['id']} changed after audit; no names applied")
            sets = ",".join(f"{key}=:{key}" for key in fields)
            conn.execute(text(f"UPDATE {table} SET {sets} WHERE id=:id"), dict(change["after"], id=change["id"]))
        if counts(conn) != original_counts:
            raise RuntimeError("Record counts changed unexpectedly")
    return original_counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--report", type=Path, default=BACKEND.parent / "docs/material-names-audit.json")
    args = parser.parse_args()
    with engine.connect() as conn:
        courses, chapters, lessons, documents, excluded = inventory(conn)
    audit = audit_files(lessons, documents)
    if audit["errors"]:
        dump(args.report, {"applied": False, "files": audit})
        raise RuntimeError(f"{audit['errors']} unreadable material references; see {args.report}")
    changes, copies = plan_names(courses, chapters, lessons, documents)
    report = dict(applied=False, numbering="Chapters per course; lessons restart per chapter; ORDER BY order_index,id",
                  totals=dict(courses=len(courses), chapters=len(chapters), lessons=len(lessons), documents=len(documents)),
                  excluded_courses=excluded, files=audit, changes=changes, copies=copies)
    dump(args.report, report)
    if args.apply and changes:
        # Retain each ledger separately, including if a subsequent run is a no-op.
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        ledger = BACKEND / "data" / "material_names" / (stamp + ".json")
        dump(ledger, report)
        report["record_counts"] = apply_changes(changes, copies)
        with engine.connect() as conn:
            fresh = inventory(conn)
        remaining, _ = plan_names(*fresh[:4])
        if remaining:
            raise RuntimeError("Post-update name verification failed")
        for entry in copies:
            if hashlib.sha256(Path(entry["destination"]).read_bytes()).hexdigest() != entry["sha256"]:
                raise RuntimeError("Copied file verification failed")
        report.update(applied=True, backup_ledger=str(ledger), verification={"remaining_name_changes": 0, "record_counts_unchanged": True, "copied_file_hashes_match": True})
        dump(ledger, report)
        dump(args.report, report)
    print(json.dumps({"applied": report["applied"], **report["totals"], "name_changes": len(changes), "file_copies": len(copies), "file_errors": audit["errors"], "report": str(args.report)}, ensure_ascii=False))


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
