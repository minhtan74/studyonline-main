"""Task API for a local teaching lab; fixed demo tokens are not a login service."""
import logging
from contextlib import asynccontextmanager
from pathlib import Path
import sqlite3
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Path as ApiPath, Query, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field

logger = logging.getLogger("task_lab")
bearer = HTTPBearer(auto_error=False)

class TaskCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    title: str = Field(min_length=1, max_length=120)

class TaskPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    done: bool = Field(strict=True)

class TaskOut(BaseModel):
    id: int
    owner_id: int
    title: str
    done: bool

class TaskPage(BaseModel):
    items: list[TaskOut]
    total: int
    offset: int
    limit: int

def create_app(database_path, tokens):
    """Create an isolated app. Token mapping is supplied only for local exercises."""
    if not str(database_path).strip() or str(database_path) == ":memory:":
        raise ValueError("Use a new SQLite file path for this lab")
    token_map = dict(tokens)
    if not token_map or any(not isinstance(key, str) or len(key) < 12 or
                            type(owner) is not int or owner < 1
                            for key, owner in token_map.items()):
        raise ValueError("Provide local demo tokens (12+ chars) mapped to positive user IDs")
    database = str(Path(database_path).resolve())

    def connect():
        conn = sqlite3.connect(database, timeout=5, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    @asynccontextmanager
    async def lifespan(app):
        Path(database).parent.mkdir(parents=True, exist_ok=True)
        conn = connect()
        try:
            with conn:
                conn.execute("""CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    owner_id INTEGER NOT NULL CHECK(owner_id > 0),
                    title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
                    done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)),
                    UNIQUE(owner_id,title))""")
        finally:
            conn.close()
        yield

    app = FastAPI(title="Local Study Task API", version="1.0.0", lifespan=lifespan)

    @app.middleware("http")
    async def request_id(request, call_next):
        marker = uuid4().hex
        response = await call_next(request)
        response.headers["X-Request-ID"] = marker
        # Never log Authorization or request body in this example.
        logger.info("request=%s method=%s path=%s status=%s", marker,
                    request.method, request.url.path, response.status_code)
        return response

    def get_db():
        conn = connect()
        try:
            yield conn
        finally:
            conn.close()

    def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
        owner = token_map.get(credentials.credentials) if credentials is not None else None
        if credentials is None or credentials.scheme.lower() != "bearer" or owner is None:
            raise HTTPException(401, "Authentication required",
                                headers={"WWW-Authenticate": "Bearer"})
        return owner

    def owned_task(conn, task_id, owner):
        task = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE id=?", (task_id,)).fetchone()
        if task is None:
            raise HTTPException(404, "Task not found")
        if task["owner_id"] != owner:
            raise HTTPException(403, "Not allowed")
        return dict(task)

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.post("/tasks", response_model=TaskOut, status_code=201)
    def create_task(payload: TaskCreate, owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        try:
            with conn:
                cursor = conn.execute("INSERT INTO tasks(owner_id,title) VALUES (?,?)",
                                      (owner, payload.title))
                task_id = cursor.lastrowid
        except sqlite3.IntegrityError as exc:
            if getattr(exc, "sqlite_errorcode", None) == sqlite3.SQLITE_CONSTRAINT_UNIQUE:
                raise HTTPException(409, "A task with this title already exists")
            raise
        return owned_task(conn, task_id, owner)

    @app.get("/tasks", response_model=TaskPage)
    def list_tasks(done: bool | None = None, offset: int = Query(0, ge=0),
                   limit: int = Query(20, ge=1, le=50),
                   owner: int = Depends(current_user),
                   conn: sqlite3.Connection = Depends(get_db)):
        where = "owner_id=?"
        values = [owner]
        if done is not None:
            where += " AND done=?"
            values.append(int(done))
        total = conn.execute("SELECT COUNT(*) FROM tasks WHERE " + where, values).fetchone()[0]
        rows = conn.execute("SELECT id,owner_id,title,done FROM tasks WHERE " + where +
                            " ORDER BY id LIMIT ? OFFSET ?", values + [limit, offset]).fetchall()
        return {"items": [dict(row) for row in rows], "total": total, "offset": offset, "limit": limit}

    @app.get("/tasks/{task_id}", response_model=TaskOut)
    def read_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                  conn: sqlite3.Connection = Depends(get_db)):
        return owned_task(conn, task_id, owner)

    @app.patch("/tasks/{task_id}", response_model=TaskOut)
    def update_task(payload: TaskPatch, task_id: int = ApiPath(ge=1),
                    owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        owned_task(conn, task_id, owner)
        with conn:
            conn.execute("UPDATE tasks SET done=? WHERE id=? AND owner_id=?",
                         (int(payload.done), task_id, owner))
        return owned_task(conn, task_id, owner)

    @app.delete("/tasks/{task_id}", status_code=204)
    def delete_task(task_id: int = ApiPath(ge=1), owner: int = Depends(current_user),
                    conn: sqlite3.Connection = Depends(get_db)):
        owned_task(conn, task_id, owner)
        with conn:
            conn.execute("DELETE FROM tasks WHERE id=? AND owner_id=?", (task_id, owner))
        return Response(status_code=204)

    return app
