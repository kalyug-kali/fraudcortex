
import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { ChartData, ConfusionMatrix, PerformanceMetrics } from '@/types';
import { cn } from '@/lib/utils';

interface FraudChartProps {
  chartType: 'channel' | 'payment' | 'gateway' | 'entity' | 'time' | 'performance';
  chartData: ChartData;
  confusionMatrix?: ConfusionMatrix;
  metrics?: PerformanceMetrics;
  title: string;
  subtitle?: string;
}

const FraudChart = ({
  chartType,
  chartData,
  confusionMatrix,
  metrics,
  title,
  subtitle
}: FraudChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const updateWidth = () => {
        setChartWidth(chartRef.current?.clientWidth || 0);
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }
  }, []);

  const COLORS = ['#0095FF', '#FF6384', '#36A2EB', '#FFCE56'];
  
  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;

    return (
      <g>
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#333" className="text-xs">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#999" className="text-xs">
          {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData.labels.map((label, i) => ({
          name: label,
          Predicted: chartData.predicted[i],
          Reported: chartData.reported[i]
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            padding: '8px 12px'
          }} 
        />
        <Legend />
        <Bar
          name="Predicted Fraud"
          dataKey="Predicted"
          fill="#0095FF"
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        />
        <Bar
          name="Reported Fraud"
          dataKey="Reported"
          fill="#FF6384"
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData.labels.map((label, i) => ({
          name: label,
          Predicted: chartData.predicted[i],
          Reported: chartData.reported[i]
        }))}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: 'none',
            padding: '8px 12px'
          }} 
        />
        <Legend />
        <Line
          name="Predicted Fraud"
          type="monotone"
          dataKey="Predicted"
          stroke="#0095FF"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
        />
        <Line
          name="Reported Fraud"
          type="monotone"
          dataKey="Reported"
          stroke="#FF6384"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPerformanceChart = () => {
    if (!confusionMatrix) return null;
    
    // Confusion matrix data
    const confusionData = [
      { name: 'True Positive', value: confusionMatrix.truePositives },
      { name: 'False Positive', value: confusionMatrix.falsePositives },
      { name: 'True Negative', value: confusionMatrix.trueNegatives },
      { name: 'False Negative', value: confusionMatrix.falseNegatives }
    ];
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Confusion Matrix</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={confusionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {confusionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Performance Metrics</h4>
          {metrics && (
            <div className="grid grid-cols-2 gap-4">
              <MetricCard 
                title="Precision" 
                value={metrics.precision} 
                description="Ratio of correctly predicted positive observations to the total predicted positives." 
              />
              <MetricCard 
                title="Recall" 
                value={metrics.recall} 
                description="Ratio of correctly predicted positive observations to all observations in actual class." 
              />
              <MetricCard 
                title="F1 Score" 
                value={metrics.f1Score} 
                description="Weighted average of Precision and Recall." 
              />
              <MetricCard 
                title="Accuracy" 
                value={metrics.accuracy} 
                description="Ratio of correctly predicted observations to the total observations." 
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, description }: { title: string, value: number, description: string }) => (
    <div className="bg-white border border-gray-100 rounded-lg p-4 card-shadow h-full">
      <h5 className="text-xs font-medium text-gray-500 mb-1">{title}</h5>
      <div className="text-xl font-semibold text-blue-600 mb-1">{(value * 100).toFixed(1)}%</div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'time':
        return renderLineChart();
      case 'performance':
        return renderPerformanceChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div ref={chartRef} className="bg-white rounded-xl p-6 card-shadow mb-6">
      <div className="mb-4">
        <h3 className="text-base font-medium text-gray-700">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {renderChart()}
    </div>
  );
};

export default FraudChart;
