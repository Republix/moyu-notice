import dayjs from 'dayjs'
import holidaysConfig from '@/config/holidays'
import { getWeekendAdjustInfo } from './day'
import { getLunarDate } from '@/plugins/lunar'
import { genFullMessageOptions } from '@/interface/msg'

const { commonSalaryDays } = holidaysConfig
const nowYear = new Date().getFullYear()
const holidays = holidaysConfig[`holidays${nowYear}`]

type useDateType = Date | string | number

/**
 * 获取date信息
 * @param {useDateType} _date
 * @returns 
 */
function getDayInfo (_date: useDateType) {
  const today = dayjs(_date)
  const year = today.year()
  const month = today.month() + 1
  const date = today.date()
  const weekday = '日一二三四五六'.charAt(today.day())
  
  const startOfYear = dayjs(`${year}-01-01`)
  const endOfYear = dayjs(`${year}-12-31`)
  const totalDays = endOfYear.diff(startOfYear, 'day') + 1
  const dayOfYear = today.diff(startOfYear, 'day') + 1
  const yearProgress = Number(
    (
      (dayOfYear / totalDays) * 100
    ).toFixed(2)
  )
  
  return {
    year,
    month,
    date,
    weekday,
    dayOfYear,
    yearProgress
  }
}

/**
 * 获取问候语 早上好, 晚上好....
 * @param {useDateType} date
 * @returns {string} 返回问候语
 */
function getDayWelcome (date: useDateType) {
  const today = dayjs(date)
  const hour = today.hour()
  const minute = today.minute()

  // 5:30 - 9:20 早上好
  if (
    (hour > 5 && hour < 9) ||
    (hour === 5 && minute >= 30) ||
    (hour === 9 && minute <= 20)
  ) {
    return '早上好'
  }
  // 9:20 - 12:00 上午好
  if (
    (hour === 9 && minute > 20) ||
    (hour > 9 && hour < 12)
  ) {
    return '上午好'
  }
  // 12:00 - 13:00 中午好
  if (hour === 12 || (hour === 13 && minute === 0)) {
    return '中午好'
  }
  // 13:00 - 18:00 下午好
  if (hour > 13 && hour < 18 || (hour === 13 && minute > 0)) {
    return '下午好'
  }
  // 其他时间 晚上好
  return '晚上好'
}

/**
 * 计算距离发薪日间隔
 * @param {useDateType} date 特定日期
 * @param {Array<number | string>} salarayDays
 * @returns {Array<{ label: number, value: number }>}
 */
function getDaysUntilSalary (date: useDateType, salarayDays?: Array<number | string>) {
  const today = dayjs(date).startOf('day')
  const currentDate = today.date()

  const result = [] as Array<{ label: number, value: number }>
  let useSalaryDays = []

  // 判断是否使用自定义日期，以及自定义发薪日期是否合法
  if (Array.isArray(salarayDays) && salarayDays.length) {
    const salaryDaysSet = new Set(
      salarayDays
        .map(day => Number(day))
        .filter(day => day >= 1 && day <= 31)
    )
    if (salaryDaysSet.size > 0) {
      useSalaryDays = Array.from(salaryDaysSet)
        .sort((a, b) => a - b)
    } else {
      useSalaryDays = commonSalaryDays
    }
  } else {
    useSalaryDays = commonSalaryDays
  }

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

/**
 * 获取周末休息信息（调休，实际工作日，距离实际休息日日期等）
 * @param {useDateType} date 
 * @returns 
 */
function getDaysUntilWeekend (date: useDateType) {
  const today = dayjs(date).startOf('day')
  
  // 获取本周末的休息信息
  const weekendInfo = getWeekendAdjustInfo(today.format('YYYY-MM-DD'))
  const dayOfWeek = today.day() // 0是周日，6是周六
  
  // 获取实际的休息日期
  const restDays = weekendInfo.restDays
  const adjustInfo = weekendInfo.adjustInfo

  // 实际距离休息日的天数
  let daysUntilRealRest = null
  let daysUnitlRealRestName = null 
  if (restDays.length > 0) {
    // 如果有休息日，计算距离下一个休息日的天数
    const nextRestDay = dayjs(restDays[0]).startOf('day')
    daysUntilRealRest = nextRestDay.diff(today, 'day')

    daysUnitlRealRestName = dayjs(restDays[0]).day() === 6 ? '周六' : '周日'
  }
  
  return {
    daysUntilSat: 6 - dayOfWeek, // 距离周六的天数
    daysUntilRealRest, // 距离实际休息日的天数
    daysUnitlRealRestName, // 周末休息日名称（"周六"或"周日"）
    restDays,  // 实际休息的日期
    adjustInfo // 调休信息
  }
}

/**
 * 距离节假日的天数
 * @param {useDateType} date
 * @returns 
 */
function getDaysUntilHolidays(date: useDateType) {
  const today = dayjs(date).startOf('day')
  const holidayCountdown = {}
  
  for (const [name, info] of Object.entries(holidays)) {
    const holidayDate = dayjs((info as any).date).startOf('day')
    const daysUntil = holidayDate.diff(today, 'day')
    
    // 只显示未来的节日
    if (daysUntil >= 0) {
      holidayCountdown[name] = daysUntil
    }
  }
  
  return holidayCountdown as Record<string, number>
}


/**
 * 获取完整的msg信息
 * @param {useDateType} targetDate 
 * @param {genFullMessageOptions} options 
 * @returns {String}
 */
export function generateMessage (targetDate: useDateType, options?: genFullMessageOptions) {
  const useDate = targetDate || new Date()
  const { salaryDays } = options || {}

  const { year, month, date, weekday, yearProgress } = getDayInfo(useDate)
  const dayWelcome = getDayWelcome(useDate)

  const daysUntilSalary = getDaysUntilSalary(useDate, salaryDays)
  const holidayCountdown = getDaysUntilHolidays(useDate)
  const weekendInfo = getDaysUntilWeekend(useDate)
  const lunarDate = getLunarDate(useDate)

  const messages = []
  messages.push(`${dayWelcome}，打工人！`)
  messages.push(`今天是 ${year}年${month}月${date}日，星期${weekday}，农历${lunarDate}。`)
  messages.push(`今年已经过去了${yearProgress}%，工作再忙，也一定不要忘记摸鱼哦！`)
  messages.push('有事没事起身去茶水间，去洗手间，去廊道走走，别总在工位上坐着，健康是自己的。')
  messages.push(``)

  messages.push('温馨提示:')
  daysUntilSalary.forEach(ds => {
    messages.push(`距离【${ds.label}号发工资】 还有：${ds.value}天`)
  })
  messages.push(``)


  // 添加调休提醒
  const adjustDays = weekendInfo.adjustInfo.filter(info => info.isAdjust)
  if (adjustDays.length > 0) {
    messages.push('本周末有调休：')
    adjustDays.forEach(info => {
      const adDay = dayjs(info.date)
      const adDayName = adDay.day() === 6 ? '周六' : '周日'
      const adDayStr = adDay.format('M月D日')
      messages.push(`${adDayName}(${adDayStr})需要上班`)
    })
  }
  // 周末信息
  const weekendRestDaysCount = weekendInfo.restDays.length
  // 本周末双休
  if (weekendRestDaysCount === 2) {
    if (weekendInfo.daysUntilSat === 0) {
      messages.push(`今天是周六，双休开始啦！`)
    } else {
      messages.push(`距离【双休周末】还有：${weekendInfo.daysUntilSat}天`)
    }
  } else if (weekendRestDaysCount === 1) {
    // 不超过时
    if (weekendInfo.daysUntilRealRest > 0) {
      messages.push(`周末单休，距离休息日${weekendInfo.daysUnitlRealRestName}还有：${weekendInfo.daysUntilRealRest}天`)
    } else if (weekendInfo.daysUntilRealRest === 0) {
      messages.push(`今天是休息日`)
    }
  } else {
    messages.push('本周周末没有休息日🙁，工作之余记得好好休息')
  }
  messages.push(``)


  messages.push('节日倒计时:')

  for (const [holiday, days] of Object.entries(holidayCountdown)) {
    if (days > 0) {
      messages.push(`距离【${holiday}】还有：${days}天`)
    } else if (days === 0) {
      messages.push(`今天是【${holiday}】`)
    }
  }
  messages.push('')
  
  return messages.join('\n')
}