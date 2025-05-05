import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const tools = [
  {
    id: "port-scanner",
    title: "Port Scanner",
    description: "Scan ports on a target host or network to discover open services and gather information about running services.",
    path: "/port-scanner"
  },
  {
    id: "wappalyzer",
    title: "Wappalyzer",
    description: "Analyze websites to detect technologies, frameworks, and services used in their stack.",
    path: "/wappalyzer"
  },
  {
    id: "whois",
    title: "WHOIS Lookup",
    description: "Look up domain registration information including registrar, creation date, expiration date, and contact details.",
    path: "/whois"
  },
  {
    id: "dns",
    title: "DNS Lookup",
    description: "Query DNS records including A, AAAA, MX, NS, TXT, and CNAME records for a domain.",
    path: "/dns"
  },
  {
    id: "subdomain-scanner",
    title: "Subdomain Scanner",
    description: "Discover subdomains of a target domain by scanning common subdomain prefixes.",
    path: "/subdomain-scanner"
  }
];

export function Home() {
  return (
    <div className="p-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to={tool.path}>Open Tool</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 