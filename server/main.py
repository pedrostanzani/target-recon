from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import PortResult, ScanRequest
from tools.PortScanner import PortScanner

app = FastAPI()
scanner = PortScanner()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.post("/scan", response_model=List[PortResult])
def scan(request: ScanRequest):
    try:
        results = scanner.scan(
            request.target,
            request.start_port,
            request.end_port,
            request.protocol.lower(),
            request.print_closed,
            request.print_filtered
        )
        return results
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Protocol inválido; use 'tcp' ou 'udp'.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
