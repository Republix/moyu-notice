const schedule = require('node-schedule');
const webhookService = require('./webhook');
const { isRestDay } = require('./day');
const { writeLog } = require('../plugins/log')

/**
 * 设置定时任务调度器
 */
function setupScheduler() {
  writeLog('Scheduler service started.');
  
  // 设置每天上午9:05执行的定时任务
  // 秒 分 时 日 月 周
  const dailyJob = schedule.scheduleJob('0 55 9 * * *', doSendTask);
  
  // 返回任务对象，以便需要时可以取消
  return {
    dailyJob
  };
}

async function doSendTask () {
  const today = new Date().toISOString().split('T')[0];
  writeLog(`定时任务执行 - ${today}`);

  // 判断是否是工作日
  if (isRestDay(today)) {
    return writeLog('今天是休息日不发送消息')
  }

  try {
    await webhookService.sendMessage();
    writeLog('Webhook消息发送成功');
  } catch (error) {
    writeLog(`定时任务执行失败: ${error.message}`);
    console.error('定时任务执行失败:', error);
  }
}

module.exports = {
  setupScheduler,
  doSendTask
};