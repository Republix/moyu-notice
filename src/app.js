const Koa = require('koa');
const Router = require('koa-router');
const { setupScheduler } = require('./services/scheduler');
const Utils = require('./utils')

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

Utils.loadConfig()

// 健康检查路由
router.get('/status', async (ctx) => {
  ctx.body = {
    status: 'running',
    message: 'm-y is running',
    time: new Date().toISOString()
  };
});

app.use(router.routes()).use(router.allowedMethods());

// 启动定时任务
setupScheduler();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});