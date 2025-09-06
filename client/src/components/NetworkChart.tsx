import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface NetworkDataPoint {
  timestamp: number;
  bandwidth: number;
  rx_rate: number;
  tx_rate: number;
  time?: string;
}

export default function NetworkChart() {
  const [realtimeData, setRealtimeData] = useState<NetworkDataPoint[]>([]);
  const [currentBandwidth, setCurrentBandwidth] = useState<number>(0);

  // Fetch initial historical data
  const { data: historicalData = [] } = useQuery({
    queryKey: ['/api/network/recent'],
    queryFn: async () => {
      const response = await fetch('/api/network/recent?minutes=10');
      const data = await response.json();
      return data.map((item: any) => ({
        timestamp: item.timestamp,
        bandwidth: (item.rx_sec + item.tx_sec) / (1024 * 1024 * 1024), // Convert to GB/s
        rx_rate: item.rx_sec / (1024 * 1024 * 1024),
        tx_rate: item.tx_sec / (1024 * 1024 * 1024),
        time: new Date(item.timestamp).toLocaleTimeString(),
      }));
    },
    refetchInterval: 5000, // Backup polling every 5 seconds
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data: NetworkDataPoint = JSON.parse(event.data);
        const dataPoint = {
          ...data,
          time: new Date(data.timestamp).toLocaleTimeString(),
        };

        setCurrentBandwidth(data.bandwidth);
        
        setRealtimeData(prev => {
          const newData = [...prev, dataPoint];
          // Keep only last 60 data points (1 minute of data)
          return newData.slice(-60);
        });
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  // Use realtime data if available, otherwise use historical data
  const chartData = realtimeData.length > 0 ? realtimeData : historicalData;

  const formatBandwidth = (value: number) => {
    if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} MB/s`;
    }
    return `${value.toFixed(3)} GB/s`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg" data-testid="chart-tooltip">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-primary">
            Bandwidth: {formatBandwidth(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4" data-testid="bandwidth-display">
        <div className="text-right text-sm text-muted-foreground mb-1">
          Bandwidth: {formatBandwidth(currentBandwidth)}
        </div>
      </div>
      
      <div className="flex-1" data-testid="network-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={formatBandwidth}
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="bandwidth" 
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}