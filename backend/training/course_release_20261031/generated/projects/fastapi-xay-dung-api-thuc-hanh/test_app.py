"""Behavior checks against temporary local data; no external services or real tokens."""
from pathlib import Path
from contextlib import closing
import sqlite3
from tempfile import TemporaryDirectory
import pytest
from fastapi.testclient import TestClient
from app import create_app

TOKENS = {"training-alice-only": 1, "training-bob-only": 2}
ALICE = {"Authorization": "Bearer training-alice-only"}
BOB = {"Authorization": "Bearer training-bob-only"}

@pytest.fixture
def lab():
    with TemporaryDirectory() as folder:
        database = str(Path(folder) / "test.sqlite3")
        with TestClient(create_app(database, TOKENS)) as client:
            yield client, database

def add(client, title="HTTP", headers=None):
    response = client.post("/tasks", json={"title": title}, headers=headers or ALICE)
    assert response.status_code == 201
    return response.json()

def test_crud_and_response_contract(lab):
    client, _ = lab
    item = add(client, "  HTTP  ")
    assert item == {"id": item["id"], "owner_id": 1, "title": "HTTP", "done": False}
    assert client.get(f"/tasks/{item['id']}", headers=ALICE).json() == item
    changed = client.patch(f"/tasks/{item['id']}", json={"done": True}, headers=ALICE)
    assert changed.status_code == 200 and changed.json()["done"] is True
    deleted = client.delete(f"/tasks/{item['id']}", headers=ALICE)
    assert deleted.status_code == 204 and deleted.content == b""
    assert client.get(f"/tasks/{item['id']}", headers=ALICE).status_code == 404

def test_validation_and_state_after_error(lab):
    client, _ = lab
    add(client, "A" * 120)
    for title in ["", "   ", "A" * 121]:
        assert client.post("/tasks", json={"title": title}, headers=ALICE).status_code == 422
    assert client.post("/tasks", json={"title": "Spoof", "owner_id": 2}, headers=ALICE).status_code == 422
    assert client.get("/tasks?limit=51", headers=ALICE).status_code == 422
    assert client.get("/tasks/0", headers=ALICE).status_code == 422
    assert client.get("/tasks", headers=ALICE).json()["total"] == 1

def test_authentication_and_cross_owner_writes(lab):
    client, _ = lab
    task = add(client)
    path = f"/tasks/{task['id']}"
    assert client.get(path).status_code == 401
    assert client.get(path, headers={"Authorization": "Bearer invalid"}).status_code == 401
    assert client.get(path, headers=BOB).status_code == 403
    assert client.patch(path, json={"done": True}, headers=BOB).status_code == 403
    assert client.delete(path, headers=BOB).status_code == 403
    assert client.get(path, headers=ALICE).json()["done"] is False
    assert client.get("/tasks", headers=BOB).json()["items"] == []

def test_unique_titles_are_scoped_by_owner(lab):
    client, database = lab
    add(client, "Same")
    assert client.post("/tasks", json={"title": "Same"}, headers=ALICE).status_code == 409
    other = add(client, "Same", BOB)
    assert other["owner_id"] == 2
    with closing(sqlite3.connect(database)) as conn:
        assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 2

def test_filtered_pagination_and_boolean_update(lab):
    client, _ = lab
    one = add(client, "First")
    add(client, "Second")
    add(client, "Third")
    assert client.patch(f"/tasks/{one['id']}", json={"done": "true"}, headers=ALICE).status_code == 422
    assert client.patch(f"/tasks/{one['id']}", json={"done": True}, headers=ALICE).status_code == 200
    result = client.get("/tasks?done=false&offset=1&limit=1", headers=ALICE).json()
    assert result["total"] == 2 and result["items"][0]["title"] == "Third"
    assert client.get("/tasks?done=true", headers=ALICE).json()["total"] == 1

def test_restart_keeps_committed_data(lab):
    client, database = lab
    item = add(client, "Persistence")
    with TestClient(create_app(database, TOKENS)) as another_app:
        response = another_app.get(f"/tasks/{item['id']}", headers=ALICE)
        assert response.status_code == 200 and response.json()["title"] == "Persistence"

def test_parameterized_input_remains_data(lab):
    client, database = lab
    strange = "Title'); DROP TABLE tasks; --"
    task = add(client, strange)
    assert client.get(f"/tasks/{task['id']}", headers=ALICE).json()["title"] == strange
    with closing(sqlite3.connect(database)) as conn:
        assert conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0] == 1

def test_configuration_and_request_ids(lab):
    client, _ = lab
    one, two = client.get("/health"), client.get("/health")
    assert one.json() == {"status": "ok"}
    assert len(one.headers["x-request-id"]) == 32
    assert one.headers["x-request-id"] != two.headers["x-request-id"]
    with pytest.raises(ValueError):
        create_app("uncreated-test.db", {})
