
export function calculateFuckingDayGap () {
  const startDate = new Date('2025-06-16 00:00:00');
  
  const now = new Date();
  
  // 计算时间差（毫秒）
  const diffMs = now.getTime() - startDate.getTime();
  
  // 转换为天数（86400000毫秒/天）
  const diffDays = Math.floor(diffMs / 86400000) + 1; // 加1因为起始日算第一天
  
  // 处理起始日期之前的情况
  if (diffDays < 1) {
    return 0; // 如果当前时间早于起始日期，返回0
  }
  
  return diffDays;
}
