import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TrendChartProps {
  data: { date: string; value: number }[];
  title?: string;
  color?: string;
  height?: number;
  unit?: string;
  areaColor?: string[];
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  color = '#3E885B',
  height = 200,
  unit = '',
  areaColor,
}) => {
  const option = useMemo(() => {
    const dates = data.map((d) => d.date.slice(5));
    const values = data.map((d) => d.value);

    return {
      grid: {
        top: 20,
        right: 10,
        bottom: 20,
        left: 40,
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
        formatter: (params: any) => {
          const { name, value } = params[0];
          return `<div style="padding: 4px 8px;">
            <div style="color: #94A3B8; font-size: 11px; margin-bottom: 4px;">${name}</div>
            <div style="color: #F8FAFC; font-size: 14px; font-weight: 600;">${value}${unit}</div>
          </div>`;
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
          interval: Math.floor(data.length / 6),
        },
      },
      yAxis: {
        type: 'value',
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
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 0,
          lineStyle: {
            color: color,
            width: 2,
            shadowColor: color,
            shadowBlur: 10,
            shadowOffsetY: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: areaColor || [
                { offset: 0, color: color + '30' },
                { offset: 1, color: color + '00' },
              ],
            },
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: color,
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: color,
              shadowBlur: 10,
            },
          },
        },
      ],
    };
  }, [data, color, unit, areaColor]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
    >
      {title && (
        <h4 className="text-sm font-medium text-white mb-2">{title}</h4>
      )}
      <ReactECharts
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </motion.div>
  );
};
