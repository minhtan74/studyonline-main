"""Read-only verification of normalized names against the local FastAPI app."""
from pathlib import Path
import hashlib
import json
import os
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
os.chdir(ROOT / "backend")

from fastapi.testclient import TestClient
from sqlalchemy import text
from app.core.database import engine
from app.core.security import create_token
from app.main import app
from app.services.material_names import numbered_title
from scripts.normalize_material_names import inventory, plan_names


def main():
    with engine.connect() as conn:
        courses, chapters, lessons, documents, _ = inventory(conn)
        user = dict(conn.execute(text("SELECT * FROM users WHERE role='admin' AND is_active=1 ORDER BY id LIMIT 1")).mappings().one())
    headers = {"Authorization": "Bearer " + create_token(user)}
    client = TestClient(app)
    remaining, copies = plan_names(courses, chapters, lessons, documents)
    assert not remaining and not copies, "Normalization must be idempotent"
    report = {"numbering_idempotent": True, "chapters": [], "lessons": [], "documents": []}
    for course in courses:
        response = client.get("/api/chapters", params={"course_id": course["id"]})
        assert response.status_code == 200
        for chapter_no, chapter in enumerate(response.json()["data"], 1):
            assert chapter["chapter_name"] == numbered_title(chapter["chapter_name"], "Chương", chapter_no)
            response = client.get("/api/lessons", params={"chapter_id": chapter["id"]}, headers=headers)
            assert response.status_code == 200
            data = response.json()["data"]
            report["chapters"].append({"id": chapter["id"], "title": chapter["chapter_name"], "lessons": len(data)})
            for lesson_no, lesson in enumerate(data, 1):
                assert lesson["title"] == numbered_title(lesson["title"], "Bài", lesson_no)
                expected_prefix = f"Chương {chapter_no} - Bài {lesson_no} - "
                assert lesson["document_name"].startswith(expected_prefix), lesson
                detail = client.get("/api/lessons", params={"id": lesson["id"]}, headers=headers)
                assert detail.status_code == 200 and detail.json()["data"]["document_name"] == lesson["document_name"]
                url = urlsplit(lesson["document_src"])
                download = client.get(url.path + "?" + url.query)
                assert download.status_code == 200
                assert lesson["document_name"] in unquote(download.headers["content-disposition"])
                assert download.content.startswith(b"%PDF")
                report["lessons"].append({"id": lesson["id"], "title": lesson["title"], "document_name": lesson["document_name"], "http": 200})
    for doc in documents:
        response = client.get(f"/api/ai/documents/{doc['id']}/source", headers=headers)
        assert response.status_code == 200, (doc["id"], response.text)
        data = response.json()["data"]
        assert data["title"] == doc["title"] and data["filename"] == doc["filename"]
        content = client.get(f"/api/ai/documents/{doc['id']}/content", headers=headers)
        assert content.status_code == 200
        assert doc["filename"] in unquote(content.headers["content-disposition"])
        assert hashlib.sha256(content.content).digest() == hashlib.sha256(Path(doc["file_path"]).read_bytes()).digest()
        report["documents"].append({"id": doc["id"], "title": doc["title"], "filename": doc["filename"], "http": 200, "file_hash_matches": True})
    # Names never grant access: unsigned lesson files and unauthenticated sources
    # must still be rejected after this presentation/data change.
    assert client.get("/api/lessons/media", params={"lesson_id": lessons[0]["id"], "kind": "document", "uid": user["id"], "exp": 1, "sig": "invalid"}).status_code == 403
    assert client.get(f"/api/ai/documents/{documents[0]['id']}/content").status_code == 401
    report["access_checks"] = {"invalid_signature": 403, "unauthenticated_source": 401}
    path = ROOT / "docs/material-names-verification.json"
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"courses": len(courses), "chapters": len(report["chapters"]), "lesson_downloads": len(report["lessons"]), "document_sources_and_downloads": len(report["documents"]), "passed": True}, ensure_ascii=False))


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
