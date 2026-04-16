import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


def create_server() -> FastAPI:
    app = FastAPI(
        title="Backend API",
        version="1.0.0"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",      # Frontend dev server
            "http://127.0.0.1:5173",      # Alternative localhost
            "http://localhost:3000",      # Alternative port
            "http://127.0.0.1:3000",      # Alternative localhost:3000
        ],
        allow_credentials=True,
        allow_methods=["*"],              # Allow all HTTP methods
        allow_headers=["*"],              # Allow all headers
    )

    # Mount static files (if needed)
    # "Mounting" means adding a complete "independent" application in a specific path, that then takes care of handling all the sub-paths.

    if not os.path.exists('static/uploads'):
        os.makedirs('static/uploads')

    app.mount("/static", StaticFiles(directory='static'), name="static")
    app.mount("/files", StaticFiles(directory='static/uploads'), name="files")
    
    return app
