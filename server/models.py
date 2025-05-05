from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class ScanRequest(BaseModel):
    # IP ou rede (ex: "192.168.1.1" ou "192.168.1.0/24")
    target: str
    start_port: int
    end_port: int
    protocol: str           # "tcp" ou "udp"
    print_closed: bool = False
    print_filtered: bool = False


class PortResult(BaseModel):
    ip: str
    port: int
    protocol: str
    # "open", "closed", "filtered", "open|filtered", "unknown", ou "error"
    status: str
    service: Optional[str] = None
    os_info: Optional[str] = None
    banner: Optional[str] = None
    error_code: Optional[int] = None
    error_message: Optional[str] = None


class AnalyzeRequest(BaseModel):
    url: HttpUrl


class Technology(BaseModel):
    name: str
    category: str


class AnalyzeResult(BaseModel):
    url: HttpUrl
    technologies: List[Technology]
