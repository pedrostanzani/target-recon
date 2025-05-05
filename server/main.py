from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import PortResult, ScanRequest, AnalyzeResult, AnalyzeRequest, WhoisRequest, WhoisRecord, DnsRequest, DnsRecord
from tools.PortScanner import PortScanner
from tools.Wappalyzer import Wappalyzer
from tools.WHOIS import WhoisTool
from tools.DNS import DnsTool

app = FastAPI()
scanner = PortScanner()
analyzer = Wappalyzer()
whois_tool = WhoisTool()
dns_tool = DnsTool()
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


@app.post("/analyze", response_model=AnalyzeResult)
def analyze(request: AnalyzeRequest):
    try:
        return analyzer.analyze(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/whois", response_model=WhoisRecord)
def whois_lookup(request: WhoisRequest):
    """
    WHOIS lookup endpoint.
    Client sends {"domain": "example.com"} and receives registrant info.
    """
    try:
        return whois_tool.lookup(request.domain)
    except ValueError as e:
        # lookup failure (invalid domain, network issue, etc.)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # unexpected errors
        raise HTTPException(status_code=500, detail="Internal WHOIS error")

@app.post("/dns", response_model=DnsRecord)
def dns_enumeration(request: DnsRequest):
    """
    DNS enumeration endpoint.
    Client sends { "domain": "example.com" }
    """
    try:
        return dns_tool.enumerate(request.domain)
    except ValueError as ve:
        # bad domain / NXDOMAIN
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        # anything else (resolver timeout, etc.)
        raise HTTPException(status_code=500, detail="Internal DNS enumeration error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
