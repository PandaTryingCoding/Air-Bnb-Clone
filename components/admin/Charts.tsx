"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartPropsType = {
  data: {
    date: string;
    count: number;
  }[];
};

function Charts({ data }: ChartPropsType) {
  return (
    <section className='mt-24'>
      <h1 className='text-4xl font-semibold text-center'>Monthly Bookings</h1>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data} margin={{ top: 50 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey='count' fill='#7c3aed' barSize={75} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
export default Charts;
