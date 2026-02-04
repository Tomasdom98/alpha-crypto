import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function FearGreedGauge({ value = 50, classification = 'Neutral' }) {
  // Calculate color based on value
  const getColor = () => {
    if (value < 25) return '#ef4444'; // Red - Extreme Fear
    if (value < 45) return '#f97316'; // Orange - Fear
    if (value < 55) return '#eab308'; // Yellow - Neutral
    if (value < 75) return '#22c55e'; // Green - Greed
    return '#10b981'; // Emerald - Extreme Greed
  };

  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: 100 - value },
  ];

  return (
    <div className="glass-card rounded-xl p-6 h-full" data-testid="fear-greed-gauge">
      <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
        Fear & Greed Index
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={getColor()} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '40%' }}>
          <div className="text-5xl font-black text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {value}
          </div>
          <div className="text-sm text-gray-400 mt-1">{classification}</div>
        </div>
      </div>
      <div className="mt-6 flex justify-between text-xs text-gray-500">
        <span>Extreme Fear</span>
        <span>Neutral</span>
        <span>Extreme Greed</span>
      </div>
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-400">
          The Fear & Greed Index measures market sentiment from 0 (extreme fear) to 100 (extreme greed).
        </p>
      </div>
    </div>
  );
}