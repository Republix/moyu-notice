import dayjs from 'dayjs'
import holidaysConfig from '@/config/holidays'
import { getWeekendAdjustInfo } from './day'
import { getLunarDate } from '@/plugins/lunar'

const { salaryDays, commonSalaryDays } = holidaysConfig
const nowYear = new Date().getFullYear()
const holidays = holidaysConfig[`holidays${nowYear}`]

// 获取工作日信息
function getWorkdayInfo(_date) {
  const today = dayjs(_date)
  const year = today.year()
  const month = today.month() + 1
  const date = today.date()
  const weekday = '日一二三四五六'.charAt(today.day())
  
  // 计算今年的进度百分比
  const startOfYear = dayjs(`${year}-01-01`)
  const endOfYear = dayjs(`${year}-12-31`)
  const totalDays = endOfYear.diff(startOfYear, 'day') + 1
  const dayOfYear = today.diff(startOfYear, 'day') + 1
  const yearProgress = Number(((dayOfYear / totalDays) * 100).toFixed(2))
  
  return {
    year,
    month,
    date,
    weekday,
    dayOfYear,
    yearProgress
  }
}

// 计算距离下一个发薪日的天数
function getDaysUntilSalary(date, useCommonSalarayDays) {
  const today = dayjs(date).startOf('day')
  const currentDate = today.date()

  const result = []
  const useSalaryDays = useCommonSalarayDays ? commonSalaryDays : salaryDays
  useSalaryDays.forEach(day => {
    let nextSalaryDay
    if (currentDate >= day) {
      // 如果当前日期已过发薪日，计算下个月的发薪日
      nextSalaryDay = today.add(1, 'month').set('date', day)
    } else {
      // 如果当前日期未到发薪日，计算本月的发薪日
      nextSalaryDay = today.set('date', day)
    }
    
    const diff = nextSalaryDay.diff(today, 'day')
    result.push({ label: day, value: diff })
  })

  return result
}

// 计算距离下一个周末的天数和调休信息
function getDaysUntilWeekend(date) {
  const today = dayjs(date).startOf('day')
  
  // 获取本周末的休息信息
  const weekendInfo = getWeekendAdjustInfo(today.format('YYYY-MM-DD'))
  const dayOfWeek = today.day() // 0是周日，6是周六
  
  // 获取实际的休息日期
  const restDays = weekendInfo.restDays
  const adjustInfo = weekendInfo.adjustInfo
  
  return {
    daysUntil: 6 - dayOfWeek, // 距离周六的天数
    restDays,  // 实际休息的日期
    adjustInfo // 调休信息
  }
}

// 计算距离节假日的天数
function getDaysUntilHolidays(date) {
  const today = dayjs(date).startOf('day')
  const holidayCountdown = {}
  
  let index = 0
  for (const [name, info] of Object.entries(holidays)) {
    const holidayDate = dayjs((info as any).date).startOf('day')
    const daysUntil = holidayDate.diff(today, 'day')
    
    // 只显示未来的节日
    if (daysUntil >= 0) {
      holidayCountdown[name] = daysUntil
    }
  }
  
  return holidayCountdown
}

function getDayWelcome(date) {
  const today = dayjs(date)
  const hour = today.hour()
  const minute = today.minute()

  if (hour < 10 && minute < 21) {
    return '早上好'
  } else if (hour < 12) {
    return '上午好'
  } else if (hour < 13) {
    return '中午好'
  } else if (hour < 18) {
    return '下午好'
  } else {
    return '晚上好'
  }
}

// 生成完整的摸鱼人日报信息
export function generateMessage (targetDate?: Date, options?: any) {
  const useDate = targetDate || new Date()
  const { useCommonSalarayDays } = options || {}

  const { year, month, date, weekday, yearProgress } = getWorkdayInfo(useDate)
  const daysUntilSalary = getDaysUntilSalary(useDate, useCommonSalarayDays)
  const holidayCountdown = getDaysUntilHolidays(useDate)
  const weekendInfo = getDaysUntilWeekend(useDate)
  const dayWelcome = getDayWelcome(useDate)
  const lunarDate = getLunarDate(useDate)

  const messages = []
  messages.push(`${dayWelcome}，打工人！`)
  messages.push(`今天是 ${year}年${month}月${date}日，星期${weekday}，农历${lunarDate}。`)
  messages.push(`今年已经过去了${yearProgress}%，工作再忙，也一定不要忘记摸鱼哦！`)
  messages.push('有事没事起身去茶水间，去厕所，去廊道走走，别总在工位上坐着，健康是自己的。')
  messages.push(``)

  messages.push('温馨提示:')
  daysUntilSalary.forEach(ds => {
    messages.push(`距离【${ds.label}号发工资】：${ds.value}天`)
  })

  messages.push(`距离【双休周末】还有：${weekendInfo.daysUntil}天`)
  messages.push(``)

  // 添加调休提醒
  const adjustDays = weekendInfo.adjustInfo.filter(info => info.isAdjust)
  if (adjustDays.length > 0) {
    messages.push('本周末调休安排：')
    adjustDays.forEach(info => {
      const date = dayjs(info.date).format('M月D日')
      messages.push(`${date}需要调休上班`)
    })
  }

  messages.push('节日倒计时:')

  for (const [holiday, days] of Object.entries(holidayCountdown)) {
    messages.push(`距离【${holiday}】还有：${days}天`)
  }
  messages.push('')
  
  return messages.join('\n')
}