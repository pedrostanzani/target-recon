# tools/Whois.py
import whois
from typing import Any, Dict

from models import WhoisRecord


class WhoisTool:
    def lookup(self, domain: str) -> WhoisRecord:
        """
        Perform a WHOIS lookup and return every available field.
        Raises ValueError on failure.
        """
        domain = domain.lower().strip()
        if domain.startswith(("http://", "https://")):
            domain = domain.split("://", 1)[1].split("/", 1)[0]

        try:
            raw = whois.whois(domain)
        except Exception as e:
            raise ValueError(f"WHOIS lookup failed: {e}")

        data: Dict[str, Any] = {
            "domain_name":      raw.domain_name,
            "registrar":        raw.registrar,
            "whois_server":     getattr(raw, "whois_server", None),
            "referral_url":     getattr(raw, "referral_url", None),
            "updated_date":     raw.updated_date,
            "creation_date":    raw.creation_date,
            "expiration_date":  getattr(raw, "expiration_date", raw.expiration_date if hasattr(raw, "expiration_date") else getattr(raw, "expires_date", None)),
            "name_servers":     raw.name_servers,
            "status":           raw.status,
            "emails":           raw.emails,
            "dnssec":           getattr(raw, "dnssec", None),
            "name":             getattr(raw, "name", None),
            "org":              getattr(raw, "org", None),
            "address":          getattr(raw, "address", None),
            "city":             getattr(raw, "city", None),
            "state":            getattr(raw, "state", None),
            "zipcode":          getattr(raw, "zipcode", None),
            "country":          getattr(raw, "country", None),
        }

        return WhoisRecord(**data)
