# tools/SubdomainScanner.py
import dns.resolver
from typing import List


class SubdomainTool:
    # 50 common subdomain prefixes
    COMMON_SUBDOMAINS = [
        "www", "mail", "ftp", "webmail", "smtp", "secure", "server", "ns1",
        "ns2", "test", "dev", "staging", "portal", "blog", "shop", "api",
        "admin", "vpn", "docs", "support", "status", "static", "img",
        "assets", "beta", "news", "mobile", "app", "video", "videos",
        "download", "downloads", "dashboard", "grafana", "ci", "jenkins",
        "git", "gitlab", "hub", "code", "build", "qa", "search", "auth",
        "m", "api-v2", "cdn", "metrics", "payments", "billing", "live",
        "studio"
    ]

    def scan(self, domain: str) -> List[str]:
        # normalize input
        domain = domain.strip().lower()
        if domain.startswith(("http://", "https://")):
            domain = domain.split("://", 1)[1].split("/", 1)[0]

        found: List[str] = []
        for prefix in self.COMMON_SUBDOMAINS:
            fqdn = f"{prefix}.{domain}"
            try:
                # only checking A records here
                dns.resolver.resolve(fqdn, "A")
                found.append(fqdn)
            except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
                continue
            except Exception:
                # timeouts, etc.
                continue

        return found
