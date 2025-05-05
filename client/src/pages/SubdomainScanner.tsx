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
interface SubdomainResult {
  subdomains: string[];
}

// Define the form schema with Zod
const formSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function SubdomainScanner() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SubdomainResult | null>(null);
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
      const response = await fetch('http://localhost:8000/subdomains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: values.domain,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Subdomain scan failed');
      }
      const data: SubdomainResult = await response.json();
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
                    <FormLabel>URL</FormLabel>
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
                        onClick={() => form.setValue("domain", "uol.com.br")}
                      >
                        Example (UOL)
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
                {loading ? 'Scanning...' : 'Scan Subdomains'}
              </Button>
              {error && <p className="text-red-600">Error: {error}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {result ? (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Subdomain</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.subdomains.map((subdomain, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{subdomain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.subdomains.length === 0 && (
                <p className="text-center text-gray-500 py-4">No subdomains found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
} 