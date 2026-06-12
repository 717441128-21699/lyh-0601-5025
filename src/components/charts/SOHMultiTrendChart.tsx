import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SOHTrendItem } from '@/types';

interface SOHMultiTrendChartProps {
  data: SOHTrendItem[];
  title?: string;
  height?: number;
}

export const SOHMultiTrendChart: React.FC<SOHMultiTrendChartProps> = ({
  data,
  title = 'SOH 等级分布趋势',
  height = 300,
}) => {
  const option = useMemo(() => {
    const dates = data.map((d) => d.date.slice(5));

    return {
      grid: {
        top: 40,
        right: 20,
        bottom: 30,
        left: 50,
      },
      legend: {
        data: ['平均SOH', 'A级', 'B级', 'C级', 'D级'],
        textStyle: {
          color: '#94A3B8',
          fontSize: 11,
        },
        top: 0,
        right: 0,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        textStyle: {
          color: '#F8FAFC',
          fontSize: 12,
        },
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748B',
          fontSize: 10,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'SOH (%)',
          nameTextStyle: {
            color: '#64748B',
            fontSize: 10,
          },
          max: 100,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#64748B',
            fontSize: 10,
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(148, 163, 184, 0.08)',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '数量 (颗)',
          nameTextStyle: {
            color: '#64748B',
            fontSize: 10,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#64748B',
            fontSize: 10,
            formatter: (value: number) => {
              if (value >= 1000) return (value / 1000) + 'k';
              return value;
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '平均SOH',
          type: 'line',
          yAxisIndex: 0,
          data: data.map((d) => d.avgSOH),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            color: '#3E885B',
            width: 2,
          },
          itemStyle: {
            color: '#3E885B',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(62, 136, 91, 0.3)' },
                { offset: 1, color: 'rgba(62, 136, 91, 0)' },
              ],
            },
          },
        },
        {
          name: 'A级',
          type: 'bar',
          yAxisIndex: 1,
          stack: 'total',
          data: data.map((d) => d.gradeA),
          itemStyle: {
            color: '#3E885B',
            borderRadius: [0, 0, 0, 0],
          },
          barWidth: '40%',
        },
        {
          name: 'B级',
          type: 'bar',
          yAxisIndex: 1,
          stack: 'total',
          data: data.map((d) => d.gradeB),
          itemStyle: {
            color: '#1E5FE8',
          },
          barWidth: '40%',
        },
        {
          name: 'C级',
          type: 'bar',
          yAxisIndex: 1,
          stack: 'total',
          data: data.map((d) => d.gradeC),
          itemStyle: {
            color: '#F45D01',
          },
          barWidth: '40%',
        },
        {
          name: 'D级',
          type: 'bar',
          yAxisIndex: 1,
          stack: 'total',
          data: data.map((d) => d.gradeD),
          itemStyle: {
            color: '#D62828',
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '40%',
        },
      ],
    };
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      {title && (
        <h3 className="section-title mb-4">{title}</h3>
      )}
      <ReactECharts
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </motion.div>
  );
};
