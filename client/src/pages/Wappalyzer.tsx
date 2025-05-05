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
interface Technology {
  name: string;
  category: string;
}

interface AnalyzeResult {
  url: string;
  technologies: Technology[];
}

// Define the form schema with Zod
const formSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function Wappalyzer() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: values.url,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Analysis request failed');
      }
      const data: AnalyzeResult = await response.json();
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
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => form.setValue("url", "https://www.uol.com.br/")}
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
                {loading ? 'Analyzing...' : 'Analyze URL'}
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
                    <th className="px-4 py-2 text-left text-sm font-semibold">Technology</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.technologies.map((tech, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{tech.name}</td>
                      <td className="px-4 py-2 text-sm">{tech.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.technologies.length === 0 && (
                <p className="text-center text-gray-500 py-4">No technologies detected.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
} 