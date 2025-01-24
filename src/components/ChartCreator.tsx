import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChartData {
  name: string;
  value: number;
}

interface ChartCreatorProps {
  onChartCreate: (chartElement: JSX.Element) => void;
}

const ChartCreator: React.FC<ChartCreatorProps> = ({ onChartCreate }) => {
  const [data, setData] = useState<ChartData[]>([
    { name: 'A', value: 400 },
    { name: 'B', value: 300 },
    { name: 'C', value: 200 },
  ]);

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  const addDataPoint = () => {
    if (!newName || !newValue) {
      toast.error('Please enter both name and value');
      return;
    }

    const value = parseFloat(newValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid number for value');
      return;
    }

    setData([...data, { name: newName, value }]);
    setNewName('');
    setNewValue('');
    toast.success('Data point added');
  };

  const createChart = () => {
    const chart = (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
    onChartCreate(chart);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex gap-2">
        <Input
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Input
          placeholder="Value"
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <Button onClick={addDataPoint}>Add Point</Button>
      </div>
      <Button onClick={createChart} className="w-full">
        Insert Chart
      </Button>
    </div>
  );
};

export default ChartCreator;