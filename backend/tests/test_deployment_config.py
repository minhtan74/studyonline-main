"""Deployment configuration tests, without database writes."""
import sys
from pathlib import Path
import pytest
from pydantic import ValidationError
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from app.core.config import Settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

def config(**values):
    return Settings(_env_file=None,**{'jwt_secret':'isolated-test-key-not-for-deployment-1234567890','app_env':'local','app_debug':False,'db_user':'studyonline_app','db_pass':'test-password','frontend_origin':'http://localhost:5173,http://127.0.0.1:5173',**values})

def test_local_origins():
    assert config().cors_origins==['http://localhost:5173','http://127.0.0.1:5173']
    assert config().app_debug is False

@pytest.mark.parametrize('values',[{'app_debug':True},{'frontend_origin':'*'},{'frontend_origin':'https://learn.example.com,*'},{'db_user':'root'},{'db_pass':''},{'frontend_origin':''}])
def test_production_rejects_unsafe_settings(values):
    with pytest.raises(ValidationError):config(app_env='production',**values)

@pytest.mark.parametrize('origin',['https://example.com/path','https://user:pass@example.com','file://example.com','null'])
def test_reject_invalid_origins(origin):
    with pytest.raises(ValidationError):config(frontend_origin=origin)

def test_production_accepts_runtime_account():
    assert config(app_env='production',frontend_origin='https://learn.example.com').cors_origins==['https://learn.example.com']

def test_cors_preflight():
    app=FastAPI()
    app.add_middleware(CORSMiddleware,allow_origins=config().cors_origins,allow_methods=['GET'],allow_headers=['Authorization'])
    client=TestClient(app)
    for origin in config().cors_origins:
        response=client.options('/api/test',headers={'Origin':origin,'Access-Control-Request-Method':'GET','Access-Control-Request-Headers':'Authorization'})
        assert response.status_code==200
        assert response.headers['access-control-allow-origin']==origin
    response=client.options('/api/test',headers={'Origin':'https://unlisted.example','Access-Control-Request-Method':'GET'})
    assert response.status_code==400
    assert 'access-control-allow-origin' not in response.headers

def test_validation_error_hides_secret():
    with pytest.raises(ValidationError) as error:config(app_env='production',app_debug=True,db_pass='hidden-test-password')
    assert 'hidden-test-password' not in str(error.value)
