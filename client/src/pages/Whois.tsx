import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define interface matching backend response
interface WhoisRecord {
  domain_name: string;
  registrar: string;
  whois_server: string | null;
  referral_url: string | null;
  updated_date: string | null;
  creation_date: string | null;
  expiration_date: string | null;
  name_servers: string[];
  status: string | string[];
  emails: string[];
  dnssec: string | null;
  name: string | null;
  org: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
}

// Define the form schema with Zod
const formSchema = z.object({
  domain: z.string().min(1, "Domain is required")
});

type FormValues = z.infer<typeof formSchema>;

export function Whois() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhoisRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: values.domain,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'WHOIS lookup failed');
      }
      const data: WhoisRecord = await response.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-8 space-y-8">
      <Card className="max-w-lg mx-auto">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. example.com"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => form.setValue("domain", "google.com")}
                      >
                        Example
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Looking up...' : 'Lookup Domain'}
              </Button>
              {error && <p className="text-red-600">Error: {error}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Domain Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Domain Name</dt>
                    <dd className="text-sm">{result.domain_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Registrar</dt>
                    <dd className="text-sm">{result.registrar || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Creation Date</dt>
                    <dd className="text-sm">{formatDate(result.creation_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Expiration Date</dt>
                    <dd className="text-sm">{formatDate(result.expiration_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Updated Date</dt>
                    <dd className="text-sm">{formatDate(result.updated_date)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Name</dt>
                    <dd className="text-sm">{result.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Organization</dt>
                    <dd className="text-sm">{result.org || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="text-sm">{result.address || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">City</dt>
                    <dd className="text-sm">{result.city || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">State</dt>
                    <dd className="text-sm">{result.state || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Country</dt>
                    <dd className="text-sm">{result.country || 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Technical Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Name Servers</dt>
                    <dd className="text-sm">
                      {result.name_servers && result.name_servers.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {result.name_servers.map((ns, index) => (
                            <li key={index}>{ns}</li>
                          ))}
                        </ul>
                      ) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="text-sm">
                      {result.status && result.status.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {Array.isArray(result.status) ? result.status.map((s, index) => (
                            <li key={index}>{s}</li>
                          )) : (
                            <li>{result.status}</li>
                          )}
                        </ul>
                      ) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">DNSSEC</dt>
                    <dd className="text-sm">{result.dnssec || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 