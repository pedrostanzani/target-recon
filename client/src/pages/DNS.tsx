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
interface DnsRecord {
  a: string[];
  aaaa: string[];
  mx: string[];
  ns: string[];
  txt: string[];
  cname: string[];
}

// Define the form schema with Zod
const formSchema = z.object({
  domain: z.string().min(1, "Domain is required").refine(
    (val) => /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(val),
    "Invalid domain format"
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function DNS() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DnsRecord | null>(null);
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
      const response = await fetch('http://localhost:8000/dns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: values.domain,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'DNS lookup failed');
      }
      const data: DnsRecord = await response.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
                {loading ? 'Looking up...' : 'Lookup DNS Records'}
              </Button>
              {error && <p className="text-red-600">Error: {error}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <div className="space-y-6">
              {Object.entries(result).map(([recordType, records]) => (
                <div key={recordType} className="space-y-2">
                  <h3 className="text-lg font-semibold capitalize">{recordType} Records</h3>
                  {records.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      {records.map((record: string, index: number) => (
                        <div key={index} className="text-sm font-mono">{record}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No {recordType.toUpperCase()} records found</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 