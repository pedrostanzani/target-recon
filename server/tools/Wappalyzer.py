import re
import requests
from bs4 import BeautifulSoup


class Wappalyzer:
    def __init__(self):
        self.rules = [
            # — Front-end Frameworks —
            {
                "name": "React",
                "category": "Front-end Framework",
                "html": [re.compile(r"data-reactroot"), re.compile(r"ReactDOM")],
                "script": [re.compile(r"react(?:-|\.)min(?:\.js)?")],
                "headers": []
            },
            {
                "name": "Next.js",
                "category": "Front-end Framework",
                "html": [re.compile(r"__NEXT_DATA__")],
                "script": [re.compile(r"/_next/static/")],
                "headers": []
            },
            {
                "name": "Angular",
                "category": "Front-end Framework",
                "html": [re.compile(r"ng-version")],
                "script": [re.compile(r"angular(?:\.js)?")],
                "headers": []
            },
            {
                "name": "Vue.js",
                "category": "Front-end Framework",
                "html": [re.compile(r"id=['\"]app['\"]")],
                "script": [re.compile(r"vue(?:\.runtime)?(?:\.min)?\.js")],
                "headers": []
            },

            # — CSS Framework —
            {
                "name": "TailwindCSS",
                "category": "CSS Framework",
                # look for typical utility-class patterns: e.g. `px-4`, `bg-red-500`, `hover:`, etc.
                "html": [
                    re.compile(
                        r'class=["\'][^"\']*(?:\b(?:p|m|text|bg|border|flex|grid|justify|items|w|h|rounded|shadow|hover|sm|md|lg):?-[\w/]+)'
                    )
                ],
                "script": [],
                "headers": []
            },

            # — CMS —
            {
                "name": "WordPress",
                "category": "CMS",
                "html": [re.compile(r"/wp-content/"), re.compile(r"wp-includes")],
                "script": [],
                "headers": []
            },
            {
                "name": "Drupal",
                "category": "CMS",
                "html": [re.compile(r"Drupal\.settings")],
                "script": [],
                "headers": []
            },

            # — Analytics —
            {
                "name": "Google Analytics",
                "category": "Analytics",
                "html": [re.compile(r"gtag\('config'"), re.compile(r"_gaq\.push")],
                "script": [
                    re.compile(r"googletagmanager\.com/gtag/js"),
                    re.compile(r"google-analytics\.com/analytics(?:\.js)?")
                ],
                "headers": []
            },
            {
                "name": "PostHog",
                "category": "Analytics",
                "html": [re.compile(r"posthog\s*\.\s*init\(")],
                "script": [re.compile(r"posthog(?:\.js)?")],
                "headers": []
            },
            {
                "name": "Plausible",
                "category": "Analytics",
                "html": [re.compile(r'data-domain=["\'][^"\']+["\']')],
                "script": [re.compile(r"plausible(?:\.js)?")],
                "headers": []
            },
            {
                "name": "Vercel Analytics",
                "category": "Analytics",
                "html": [],
                "script": [re.compile(r"_vercel/insights")],
                "headers": []
            },

            # — Payment Processors —
            {
                "name": "Stripe",
                "category": "Payment Processor",
                "html": [re.compile(r"Stripe\(")],
                "script": [re.compile(r"js\.stripe\.com/v3/")],
                "headers": []
            },

            # — CDN & Web Servers —
            {
                "name": "Amazon S3",
                "category": "CDN",
                "html": [re.compile(r"https?://[^\s\"']+\.s3\.amazonaws\.com")],
                "script": [re.compile(r"s3\.amazonaws\.com")],
                "headers": [("server", re.compile(r"AmazonS3"))]
            },
            {
                "name": "nginx",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("server", re.compile(r"nginx", re.I))]
            },
            {
                "name": "Apache",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("server", re.compile(r"apache", re.I))]
            },
            {
                "name": "Cloudflare",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("server", re.compile(r"cloudflare", re.I))]
            },

            # — Hosting / Platforms —
            {
                "name": "Vercel",
                "category": "Hosting / Platform",
                "html": [],
                "script": [],
                "headers": [
                    ("server", re.compile(r"vercel", re.I)),
                    ("x-vercel-id", re.compile(r".+"))
                ]
            },
            {
                "name": "Amazon Web Services",
                "category": "PaaS",
                "html": [],
                "script": [re.compile(r"sdk\.amazonaws\.com/js/aws-sdk")],
                "headers": [("x-amzn-requestid", re.compile(r".+"))]
            },
        ]

    def analyze(self, url: str) -> dict:
        """
        Fetches the given URL and applies each rule.
        Returns a dict with 'url' and a list of detected {name, category}.
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'DNT': '1'
        }

        try:
            resp = requests.get(url, headers=headers, timeout=10)
        except Exception as e:
            raise ValueError(f"Could not fetch URL: {e}")

        html = resp.text or ""
        # gather all <script src="…">
        soup = BeautifulSoup(html, "html.parser")
        script_srcs = [tag["src"] for tag in soup.find_all("script", src=True)]

        detected = []
        for rule in self.rules:
            found = False

            # 1) check HTML body
            for rx in rule["html"]:
                if rx.search(html):
                    found = True
                    break

            # 2) check <script> URLs
            if not found:
                for rx in rule["script"]:
                    if any(rx.search(src) for src in script_srcs):
                        found = True
                        break

            # 3) check headers
            if not found:
                for header_name, rx in rule["headers"]:
                    val = resp.headers.get(header_name, "")
                    if rx.search(val):
                        found = True
                        break

            if found:
                detected.append({
                    "name": rule["name"],
                    "category": rule["category"]
                })

        return {"url": url, "technologies": detected}
