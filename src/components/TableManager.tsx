import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Grid, BarChart3, Plus, Trash } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface TableManagerProps {
  onCreateTable: (rows: number, cols: number) => void;
  onCreateChart: (data: any[]) => void;
}

const TableManager: React.FC<TableManagerProps> = ({ onCreateTable, onCreateChart }) => {
  const [rows, setRows] = React.useState(3);
  const [cols, setCols] = React.useState(3);
  const { toast } = useToast();

  const handleCreateTable = () => {
    if (rows > 0 && cols > 0) {
      onCreateTable(rows, cols);
      toast({
        title: "Success",
        description: `Created table with ${rows} rows and ${cols} columns`,
      });
    }
  };

  const sampleData = [
    { name: 'A', value: 400 },
    { name: 'B', value: 300 },
    { name: 'C', value: 200 },
    { name: 'D', value: 278 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="number"
          min="1"
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value) || 1)}
          placeholder="Rows"
          className="w-24"
        />
        <Input
          type="number"
          min="1"
          value={cols}
          onChange={(e) => setCols(parseInt(e.target.value) || 1)}
          placeholder="Columns"
          className="w-24"
        />
        <Button variant="outline" size="sm" onClick={handleCreateTable}>
          <Grid className="w-4 h-4 mr-2" />
          Create Table
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onCreateChart(sampleData)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Add Chart
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Preview</h3>
        <Table>
          <TableHeader>
            <TableRow>
              {Array(cols).fill(0).map((_, i) => (
                <TableHead key={i}>Header {i + 1}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(rows).fill(0).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array(cols).fill(0).map((_, colIndex) => (
                  <TableCell key={colIndex}>Cell {rowIndex + 1}-{colIndex + 1}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Chart Preview</h3>
        <LineChart width={500} height={300} data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
};

export default TableManager;