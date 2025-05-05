from datetime import datetime
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Union


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


class WhoisRequest(BaseModel):
    domain: str


class WhoisRecord(BaseModel):
    domain_name: Optional[Union[str, List[str]]]
    registrar: Optional[str]
    whois_server: Optional[str]
    referral_url: Optional[str]
    updated_date: Optional[Union[datetime, List[datetime]]]
    creation_date: Optional[Union[datetime, List[datetime]]]
    expiration_date: Optional[Union[datetime, List[datetime]]]
    name_servers: Optional[List[str]]
    status: Optional[Union[str, List[str]]]
    emails: Optional[List[str]]
    dnssec: Optional[str]
    # contact / registrant fields
    name: Optional[str]
    org: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zipcode: Optional[str]
    country: Optional[str]

class DnsRequest(BaseModel):
    domain: str

class DnsRecord(BaseModel):
    a:        List[str] = []
    aaaa:     List[str] = []
    mx:       List[str] = []
    ns:       List[str] = []
    txt:      List[str] = []
    cname:    List[str] = []
