"""
Fase 8 - Beta Launch Program
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.beta import router as beta_router

app = FastAPI(
    title="MMN_AI Beta Program API",
    description="API para gerenciamento do programa beta da plataforma MMN_AI-to-AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(beta_router)


@app.get("/")
def root():
    return {
        "service": "MMN_AI Beta Program API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)