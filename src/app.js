const Koa = require('koa');
const Router = require('koa-router');
const { setupScheduler } = require('./services/scheduler');
const { generateMessage } = require('./services/message')
const Utils = require('./utils')
const { appLogger, logAccess } = require('./plugins/log')

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3151;

app.proxy = true;

Utils.loadConfig();

const accessLogMidware = async (ctx, next) => {
  await next();

  const { ip, path, headers } = ctx;
  const ua = headers['user-agent'];
  logAccess({ ip, path, ua });
};

router
  .get('/status', ctx => {
    const date = new Date()
    const time = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`

    ctx.body = {
      status: 'ok',
      message: 'm-y is running',
      ip: ctx.ip,
      time
    };
  })
  .get('/msg', accessLogMidware, ctx => {
    ctx.body = generateMessage(new Date(), ctx.query)
  })
  .get('/msg2', accessLogMidware, ctx => {
    ctx.body = {
      succ: true,
      data: generateMessage(new Date(), ctx.query)
    }
  })

app.use(router.routes()).use(router.allowedMethods());

// 启动定时任务
setupScheduler();

app.listen(PORT, () => {
  appLogger.info(`Server running on http://localhost:${PORT}`);
});