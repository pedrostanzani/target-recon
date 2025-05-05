import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
interface PortResult {
  ip: string;
  port: number;
  protocol: string;
  status: string;
  service: string;
  os_info: string;
  banner?: string;
  error_code?: number;
  error_message?: string;
}

// Define the form schema with Zod
const formSchema = z.object({
  target: z.string().min(1, "Target is required"),
  startPort: z.string().min(1).refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 65535, {
    message: "Start port must be a number between 1 and 65535",
  }),
  endPort: z.string().min(1).refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 65535, {
    message: "End port must be a number between 1 and 65535",
  }),
  protocol: z.enum(["tcp", "udp"]),
  printClosed: z.boolean(),
  printFiltered: z.boolean(),
}).refine((data) => Number(data.startPort) <= Number(data.endPort), {
  message: "Start port must be less than or equal to end port",
  path: ["endPort"],
});

type FormValues = z.infer<typeof formSchema>;

export function PortScanner() {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target: "",
      startPort: "3000",
      endPort: "8000",
      protocol: "tcp",
      printClosed: false,
      printFiltered: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await fetch('http://localhost:8000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: values.target,
          start_port: Number(values.startPort),
          end_port: Number(values.endPort),
          protocol: values.protocol,
          print_closed: values.printClosed,
          print_filtered: values.printFiltered,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Scan request failed');
      }
      const data: PortResult[] = await response.json();
      setResults(data);
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
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. 192.168.1.1 or 192.168.1.0/24"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => form.setValue("target", "127.0.0.1")}
                      >
                        localhost
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Port</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Port</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protocol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="printClosed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Show closed</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="printFiltered"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Show filtered</FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Scanning...' : 'Start Scan'}
              </Button>
              {error && <p className="text-red-600">Error: {error}</p>}
            </form>
          </Form>
        </CardContent>
      </Card>

      {results.length > 0 ? (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold">IP</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Port</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Protocol</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Service</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">OS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((r) => (
                    <tr key={`${r.ip}-${r.port}-${r.protocol}`}> 
                      <td className="px-4 py-2 text-sm">{r.ip}</td>
                      <td className="px-4 py-2 text-sm">{r.port}</td>
                      <td className="px-4 py-2 text-sm uppercase">{r.protocol}</td>
                      <td className="px-4 py-2 text-sm capitalize">{r.status}</td>
                      <td className="px-4 py-2 text-sm">{r.service}</td>
                      <td className="px-4 py-2 text-sm">{r.os_info}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : results.length === 0 && !loading && !error ? (
        <Card className="max-w-4xl mx-auto">
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No results found.
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
} 