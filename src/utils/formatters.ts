export const formatNumber = (num: number, decimals: number = 0): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(decimals + 1) + '万';
  }
  return num.toLocaleString('zh-CN', { maximumFractionDigits: decimals });
};

export const formatPercent = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals) + '%';
};

export const formatCurrency = (num: number): string => {
  if (num >= 100000000) {
    return '¥' + (num / 100000000).toFixed(2) + '亿';
  }
  if (num >= 10000) {
    return '¥' + (num / 10000).toFixed(2) + '万';
  }
  return '¥' + num.toLocaleString('zh-CN');
};

export const formatWeight = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + ' 吨';
  }
  return num.toFixed(0) + ' kg';
};

export const formatTrend = (value: number): { text: string; positive: boolean } => {
  if (value > 0) {
    return { text: `+${value.toFixed(1)}%`, positive: true };
  } else if (value < 0) {
    return { text: `${value.toFixed(1)}%`, positive: false };
  }
  return { text: '0%', positive: true };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
