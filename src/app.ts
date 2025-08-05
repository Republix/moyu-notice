import Koa from 'koa'

import { loadConfig } from '@/utils'
import { appLogger } from '@/plugins/log'
import router from '@/api'

const app = new Koa();
const PORT = process.env.PORT || 4300;

app.proxy = true;

loadConfig()

app.use(router.routes()).use(router.allowedMethods())


app.listen(PORT, () => {
  appLogger.info(`Server running on http://localhost:${PORT}`)
})