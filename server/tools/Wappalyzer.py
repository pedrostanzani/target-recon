import re
import requests
from bs4 import BeautifulSoup


class Wappalyzer:
    def __init__(self):
        self.rules = [
            {
                "name": "React",
                "category": "Front-end Framework",
                "html": [re.compile(r"data-reactroot"), re.compile(r"ReactDOM")],
                "script": [re.compile(r"react(-|\.)min(\.js)?")],
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
                "script": [re.compile(r"angular(\.js)?")],
                "headers": []
            },
            {
                "name": "Vue.js",
                "category": "Front-end Framework",
                "html": [re.compile(r"id=\"app\"")],
                "script": [re.compile(r"vue(\.runtime)?(\.min)?\.js")],
                "headers": []
            },
            {
                "name": "TailwindCSS",
                "category": "CSS Framework",
                "html": [],
                "script": [re.compile(r"cdn\.tailwindcss\.com")],
                "headers": []
            },
            {
                "name": "WordPress",
                "category": "CMS",
                "html": [re.compile(r"/wp-content/"), re.compile(r"wp-")],
                "script": [],
                "headers": []
            },
            {
                "name": "Drupal",
                "category": "CMS",
                "html": [re.compile(r"Drupal.settings")],
                "script": [],
                "headers": []
            },
            {
                "name": "nginx",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("Server", re.compile(r"nginx", re.I))]
            },
            {
                "name": "Apache",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("Server", re.compile(r"apache", re.I))]
            },
            {
                "name": "Cloudflare",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("Server", re.compile(r"cloudflare", re.I))]
            },
            {
                "name": "Cloudflare",
                "category": "Web Server / CDN",
                "html": [],
                "script": [],
                "headers": [("server", re.compile(r"cloudflare", re.I))]
            },
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
