const schedule = require('node-schedule');
const webhookService = require('./webhook');
const { isRestDay } = require('./day');


// 写入日志
function writeLog(message) {
  console.log(message)
}


/**
 * 设置定时任务调度器
 */
function setupScheduler() {
  console.log('Setting up scheduler...');
  writeLog('Scheduler service started.');  // 移除debug模式
  
  // 设置每天上午9:05执行的定时任务
  // 秒 分 时 日 月 周
  const dailyJob = schedule.scheduleJob('0 5 9 * * *', async function() {
    const today = new Date().toISOString().split('T')[0];
    writeLog(`定时任务执行 - ${today}`);

    // 判断是否是休息日
    if (isRestDay(today)) {
      try {
        await webhookService.sendMessage();
        writeLog('Webhook消息发送成功');
      } catch (error) {
        writeLog(`定时任务执行失败: ${error.message}`);
        console.error('定时任务执行失败:', error);
      }
    } else {
      writeLog('今天是工作日，不发送消息');
    }
  });
  
  console.log('定时任务已设置，将在每天上午9:05执行');
  
  // 返回任务对象，以便需要时可以取消
  return {
    dailyJob
  };
}

module.exports = {
  setupScheduler
};