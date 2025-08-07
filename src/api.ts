import Router from 'koa-router'
import { logAccess } from '@/plugins/log'

const router = new Router()

const accessLogMidware = async (ctx, next) => {
  await next()

  const { ip, path, headers } = ctx
  const ua = headers['user-agent']
  logAccess({ ip, path, ua })
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

  // devs tools
  router.use(accessLogMidware)
  // devs
  .get('/ds-list1', ctx => {

      const data = [
        { type1: '测试1', type2: '测试2', type3: 'testing3', type4: '44444', type: 'primary' },
        { type1: '测试12', type2: '测试22', type3: 'testing32', type4: '444442', type: 'success' },
        { type1: '测试13', type2: '测试23', type3: 'testing33', type4: '444443', type: 'danger' },
        { type1: '测试14', type2: '测试24', type3: 'testing34', type4: '444444', type: 'info' },
        { type1: '测试15', type2: '测试25', type3: 'testing34', type4: '444445', type: 'danger' },
      ]

    ctx.body = {
      data: data,
      succ: true,
      code: 200
    }
  })
  .get('/ds-data1', ctx => {
    ctx.body = {
      data: {
        count1: 10,
        count2: 20,
        dataA: {
          countA: 'abcdedg',
          countB: 'Test'
        }
      },
      succ: true,
      code: 200
    }
  })

  export default router