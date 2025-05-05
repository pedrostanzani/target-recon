import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

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

function App() {
  const [target, setTarget] = useState('');
  const [startPort, setStartPort] = useState<number>(3000);
  const [endPort, setEndPort] = useState<number>(8000);
  const [protocol, setProtocol] = useState<'tcp' | 'udp'>('tcp');
  const [printClosed, setPrintClosed] = useState<boolean>(false);
  const [printFiltered, setPrintFiltered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await fetch('http://localhost:8000/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          start_port: startPort,
          end_port: endPort,
          protocol,
          print_closed: printClosed,
          print_filtered: printFiltered,
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="target" className="mb-2 block">Target</Label>
              <div className="flex gap-2">
                <Input
                  id="target"
                  placeholder="e.g. 192.168.1.1 or 192.168.1.0/24"
                  value={target}
                  onChange={(e) => setTarget(e.currentTarget.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => setTarget('127.0.0.1')}
                  type="button"
                >
                  localhost
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startPort" className="mb-2 block">Start Port</Label>
                <Input
                  id="startPort"
                  type="number"
                  value={startPort}
                  onChange={(e) => setStartPort(Number(e.currentTarget.value))}
                />
              </div>
              <div>
                <Label htmlFor="endPort" className="mb-2 block">End Port</Label>
                <Input
                  id="endPort"
                  type="number"
                  value={endPort}
                  onChange={(e) => setEndPort(Number(e.currentTarget.value))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="protocol" className="mb-2 block">Protocol</Label>
              <Select
                value={protocol}
                onValueChange={(value) => setProtocol(value as 'tcp' | 'udp')}
              >
                <SelectTrigger id="protocol">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="printClosed"
                checked={printClosed}
                onCheckedChange={(checked) => setPrintClosed(!!checked)}
              />
              <Label htmlFor="printClosed">Show closed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="printFiltered"
                checked={printFiltered}
                onCheckedChange={(checked) => setPrintFiltered(!!checked)}
              />
              <Label htmlFor="printFiltered">Show filtered</Label>
            </div>
            <Button
              variant="default"
              onClick={handleScan}
              disabled={loading}
            >
              {loading ? 'Scanning...' : 'Start Scan'}
            </Button>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
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

export default App;
