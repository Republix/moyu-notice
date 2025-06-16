// const LunarCalendar = require('../../lib/lunar')
import LunarCalendar from '@lib/lunar'

function getLunarObj (date) {
  return LunarCalendar.solar2lunar(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

function getLunarDate (date) {
  const lunar = getLunarObj(date)
  if (lunar === -1 || !lunar) return null

  return `${lunar.IMonthCn}${lunar.IDayCn}`
}

// module.exports = {
//   getLunarDate
// }

export {
  getLunarDate
}