import Router from 'koa-router'
import { logAccess } from '@/plugins/log'
import { generateMessage } from '@/services/message'
import { genFullMessageOptions } from '@/interface/msg'
import { calculateFuckingDayGap } from '@/services/fucking'

const router = new Router()

const accessLogMidware = async (ctx, next) => {
  await next()

  const { ip, path, headers } = ctx
  const ua = headers['user-agent']
  logAccess({ ip, path, ua })
}

interface GenMsgParams {
  salaryDays?: string, // 指定工资日(逗号隔开)
}

const genMsgParamsConvert = (params: GenMsgParams) => {
  const result = { ...params } as Record<string, any>

  if (params.salaryDays) {
    result.salaryDays = params.salaryDays.split(',')
  }

  return result as genFullMessageOptions
}

const queryToFullMsg = (query) => {
  const params = genMsgParamsConvert(query)

  return generateMessage(new Date(), params)
}

router
  .get('/status', ctx => {
    const date = new Date()
    const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`

    ctx.body = {
      status: 'ok',
      message: 'm-y is running',
      ip: ctx.ip,
      time
    }
  })
  .get('/msg', accessLogMidware, ctx => {
    ctx.body = queryToFullMsg(ctx.query)
  })
  .get('/msg2', accessLogMidware, ctx => {
    ctx.body = {
      succ: true,
      data: queryToFullMsg(ctx.query)
    }
  })
  .get('/goesby/bio', ctx => {
    ctx.body = {
      succ: true,
      data: calculateFuckingDayGap()
    }
  })

  export default router