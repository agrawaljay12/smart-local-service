import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


def create_server() -> FastAPI:
    app = FastAPI(
        title="Backend API",
        version="1.0.0"
    )

    origin =[
            "http://localhost:5173",      # Frontend dev server
            "http://127.0.0.1:5173",      # Alternative localhost
            "http://localhost:3000",      # Alternative port
            "http://127.0.0.1:3000",      # Alternative localhost:3000
            "https://servicehub-blush.vercel.app"
        ]
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origin,
        allow_credentials=True,
        allow_methods=["*"],              # Allow all HTTP methods
        allow_headers=["*"],              # Allow all headers
    )

    @app.options("/{rest_of_path:path}")
    async def preflight_handler():
        return {"status": "ok"}

    # Mount static files (if needed)
    # "Mounting" means adding a complete "independent" application in a specific path, that then takes care of handling all the sub-paths.
    
    BASE_DIR = Path(__file__).resolve().parent.parent
    static_dir = BASE_DIR / "static"
    uploads_dir = static_dir / "uploads"

    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    if not os.path.exists('static/uploads/provider'):
        os.makedirs('static/uploads/provider')

    if not os.path.exists('static/uploads/user'):
        os.makedirs('static/uploads/user')

    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    if uploads_dir.exists():
        app.mount("/files", StaticFiles(directory=uploads_dir), name="files")
    
    return app
