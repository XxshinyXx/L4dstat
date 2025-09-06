import { useQuery } from '@tanstack/react-query';
import { Monitor, Wifi, Activity, Clock } from 'lucide-react';
import NetworkChart from '../components/NetworkChart';

export default function Dashboard() {
  const { data: currentStats } = useQuery({
    queryKey: ['/api/network/current'],
    queryFn: async () => {
      const response = await fetch('/api/network/current');
      return response.json();
    },
    refetchInterval: 2000,
  });

  const formatBandwidth = (value: number) => {
    if (!value) return '0.00 MB/s';
    if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} MB/s`;
    }
    return `${value.toFixed(3)} GB/s`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
            Live Layer 4 DDoS/AT Launch
          </h1>
          <p className="text-muted-foreground" data-testid="server-info">
            {currentStats?.interface || '216.202.200.164'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            data-testid="button-copy-url"
          >
            📋 Copy URL
          </button>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            data-testid="button-tcp"
          >
            📊 TCP → 22
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            data-testid="button-udp"
          >
            📊 UDP → 53
          </button>
          <button 
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            data-testid="button-whois"
          >
            🔍 WHOIS
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            data-testid="button-ping-check"
          >
            📡 Ping Check
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6" data-testid="card-bandwidth">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Bandwidth</h3>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatBandwidth(currentStats?.bandwidth || 0)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6" data-testid="card-download">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Download Rate</h3>
              <Wifi className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatBandwidth(currentStats?.rx_rate || 0)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6" data-testid="card-upload">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Upload Rate</h3>
              <Monitor className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatBandwidth(currentStats?.tx_rate || 0)}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6" data-testid="card-status">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-green-500">
              Live
            </div>
          </div>
        </div>

        {/* Network Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground" data-testid="chart-title">
              Network Traffic
            </h2>
            <div className="text-sm text-muted-foreground" data-testid="chart-legend">
              <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
              Bandwidth: {formatBandwidth(currentStats?.bandwidth || 0)}
            </div>
          </div>
          <div className="h-80">
            <NetworkChart />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p data-testid="footer-info">
            Real-time network monitoring • Updates every second
          </p>
        </div>
      </div>
    </div>
  );
}