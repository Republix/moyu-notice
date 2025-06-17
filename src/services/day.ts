import holidayConfig from '@/config/holidays'
import dayjs from 'dayjs'

const { holidays2025, adjustRestDays } = holidayConfig

/**
 * 判断某一天是否是休息日（包括法定节假日和非调休的周六日）
 * @param {string} dateStr - 日期字符串，格式为 'YYYY-MM-DD'
 * @returns {boolean} - 是否是休息日
 */
export function isRestDay (dateStr) {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 获取星期几（0-6，0是周日）

  // 1. 判断是否是法定节假日
  for (const holiday of Object.values(holidays2025)) {
    if (holiday.gap.includes(dateStr)) {
      return true
    }
  }

  // 2. 判断是否是调休日（调休日需要上班，不算休息日）
  if (adjustRestDays.includes(dateStr)) {
    return false
  }

  // 3. 判断是否是周末（周六或周日）
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true
  }

  // 其他情况为工作日
  return false
}


interface WeekendAdjustINfo {
  weekendDates: string[]; // 本周末的日期（周六和周日）
  adjustInfo: { date: string; isAdjust: boolean }[]; // 调休信息
  restDays: string[]; // 实际休息的日期
}

/**
 * 判断某一天所属的周末是否有调休，以及双休日中哪一天休息
 * @param {String} dateStr - 日期字符串，格式为 'YYYY-MM-DD'
 * @returns {WeekendAdjustINfo} - 返回调休信息和休息日信息
 */
export function getWeekendAdjustInfo (dateStr): WeekendAdjustINfo {
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() // 获取星期几（0-6，0是周日）

  // 计算本周六，本周日的日期
  const saturday = new Date(date)
  saturday.setDate(date.getDate() + (6 - dayOfWeek))
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)

  const weekendDates = [
    dayjs(saturday).format('YYYY-MM-DD'), // 周六
    dayjs(sunday).format('YYYY-MM-DD'), // 周六
  ]

  // 判断周末是否有调休
  const adjustInfo = weekendDates.map((date) => ({
    date,
    isAdjust: adjustRestDays.includes(date),
  }))

  // 判断双休日中哪一天休息
  const restDays = weekendDates.filter((date) => isRestDay(date))

  return {
    weekendDates, // 本周末的日期（周六和周日）
    adjustInfo, // 调休信息
    restDays, // 实际休息的日期
  }
}
