import Koa from 'koa'

import { loadConfig } from '@/utils'
import { appLogger } from '@/plugins/log'
import { setupScheduler } from '@/services/scheduler'
import router from '@/api'

const app = new Koa();
const PORT = process.env.PORT || 3151;

app.proxy = true;

loadConfig()

app.use(router.routes()).use(router.allowedMethods())

// 启动定时任务
setupScheduler()

app.listen(PORT, () => {
  appLogger.info(`Server running on http://localhost:${PORT}`)
})