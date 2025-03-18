const dayjs = require('dayjs');
const holidaysConfig = require('../config/holidays');
const { getWeekendAdjustInfo } = require('./day');

const { salary } = holidaysConfig;
const nowYear = new Date().getFullYear();
const holidays = holidaysConfig[`holidays${nowYear}`];

// 获取工作日信息
function getWorkdayInfo() {
  const today = dayjs();
  const year = today.year();
  const month = today.month() + 1;
  const date = today.date();
  const weekday = '日一二三四五六'.charAt(today.day());
  
  // 计算今年的进度百分比
  const startOfYear = dayjs(`${year}-01-01`);
  const endOfYear = dayjs(`${year}-12-31`);
  const totalDays = endOfYear.diff(startOfYear, 'day') + 1;
  const dayOfYear = today.diff(startOfYear, 'day') + 1;
  const yearProgress = Number(((dayOfYear / totalDays) * 100).toFixed(2));
  
  return {
    year,
    month,
    date,
    weekday,
    dayOfYear,
    yearProgress
  };
}

// 计算距离下一个发薪日的天数
function getDaysUntilSalary() {
  const today = dayjs();
  const currentDate = today.date();
  
  let nextSalaryDay;
  if (currentDate >= salary.day) {
    // 如果当前日期已过发薪日，计算下个月的发薪日
    nextSalaryDay = today.add(1, 'month').set('date', salary.day);
  } else {
    // 如果当前日期未到发薪日，计算本月的发薪日
    nextSalaryDay = today.set('date', salary.day);
  }
  
  return nextSalaryDay.diff(today, 'day');
}

// 计算距离下一个周末的天数和调休信息
function getDaysUntilWeekend() {
  const today = dayjs();
  
  // 获取本周末的休息信息
  const weekendInfo = getWeekendAdjustInfo(today.format('YYYY-MM-DD'));
  const dayOfWeek = today.day(); // 0是周日，6是周六
  
  // 获取实际的休息日期
  const restDays = weekendInfo.restDays;
  const adjustInfo = weekendInfo.adjustInfo;
  
  return {
    daysUntil: 6 - dayOfWeek, // 距离周六的天数
    restDays,  // 实际休息的日期
    adjustInfo // 调休信息
  };
}

// 计算距离节假日的天数
function getDaysUntilHolidays() {
  const today = dayjs();
  const holidayCountdown = {};
  
  for (const [name, info] of Object.entries(holidays)) {
    const holidayDate = dayjs(info.date);
    const daysUntil = holidayDate.diff(today, 'day');
    
    // 只显示未来的节日
    if (daysUntil >= 0) {
      holidayCountdown[name] = daysUntil;
    }
  }
  
  return holidayCountdown;
}

// 生成完整的摸鱼人日报信息
function generateMessage() {
  const { year, month, date, weekday, yearProgress } = getWorkdayInfo();
  const daysUntilSalary = getDaysUntilSalary();
  const holidayCountdown = getDaysUntilHolidays();
  
  let message = `今天是 ${year}年${month}月${date}日，星期${weekday}。`;
  message += '早上好，打工人！';
  message += `今年已经过去了${yearProgress}%，也一定不要忘记摸鱼哦！`;
  message += '有事没事起身去茶水间，去厕所，去廊道走走，别总在工位上坐着，但健康是自己的。\n\n';
  
  const weekendInfo = getDaysUntilWeekend();
  
  message += '温馨提示:\n';
  message += `距离【12号发工资】：${daysUntilSalary}天\n`;
  message += `距离【双休周末】还有：${weekendInfo.daysUntil}天\n`;
  
  // 添加调休提醒
  const adjustDays = weekendInfo.adjustInfo.filter(info => info.isAdjust);
  if (adjustDays.length > 0) {
    message += '本周末调休安排：\n';
    adjustDays.forEach(info => {
      const date = dayjs(info.date).format('M月D日');
      message += `${date}需要调休上班\n`;
    });
  }
  
  message += '\n';
  
  message += '节日倒计时:\n';
  for (const [holiday, days] of Object.entries(holidayCountdown)) {
    message += `距离【${holiday}】还有：${days}天\n`;
  }
  
  return message;
}

module.exports = {
  generateMessage
};