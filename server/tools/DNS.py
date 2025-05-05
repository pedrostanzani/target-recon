import dns.resolver
from typing import Dict, List

from models import DnsRecord

class DnsTool:
    def enumerate(self, domain: str) -> DnsRecord:
        """
        Query the common DNS record types for `domain` and return a DnsRecord.
        Raises ValueError if the domain doesn't exist or is malformed.
        """
        # normalize
        domain = domain.strip().lower()
        if domain.startswith(("http://", "https://")):
            domain = domain.split("://", 1)[1].split("/", 1)[0]

        record_map: Dict[str,str] = {
            "a":     "A",
            "aaaa":  "AAAA",
            "mx":    "MX",
            "ns":    "NS",
            "txt":   "TXT",
            "cname": "CNAME",
        }

        results: Dict[str, List[str]] = {}
        for field, rtype in record_map.items():
            try:
                answers = dns.resolver.resolve(domain, rtype)
                results[field] = [rdata.to_text() for rdata in answers]
            except dns.resolver.NoAnswer:
                results[field] = []
            except dns.resolver.NXDOMAIN as e:
                raise ValueError(f"Domain not found: {domain}") from e
            except Exception:
                # catch timeouts, servfail, etc.
                results[field] = []

        return DnsRecord(**results)
