from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from getMonitoringData import get_system_info

app = FastAPI()

# CORS configuration
origins = ["*"]  # Allow all origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/system")
async def read_system():
    return get_system_info()