const log4js = require('log4js');

// 配置log4js
log4js.configure({
  appenders: {
    console: { type: 'console' },
    scheduleFile: { 
      type: 'file', 
      filename: 'logs/scheduler.log',
      maxLogSize: 10485760, // 10MB
      backups: 3,
      compress: true 
    },
    accessLog: {
      type: 'file',
      filename: 'logs/access.log',
      maxLogSize: 10485760, // 10MB
      backups: 3,
      compress: true
    },
  },
  categories: {
    default: { 
      appenders: ['console', 'scheduleFile'], 
      level: 'info' 
    },
    access: {
      appenders: ['console', 'accessLog'],
      level: 'info'
    },
  }
});

// module.exports = log4js.getLogger('scheduler');
const logger = log4js.getLogger('scheduler');

const appLogger = log4js.getLogger('app');
const accessLogger = log4js.getLogger('access');

exports.appLogger = appLogger;

exports.writeLog = (message) => {
  logger.info(message);
};

exports.logAccess = ({ ip, ua, path }) => {
  accessLogger.info(`ip: ${ip} - path: ${path} - ua: ${ua} - `);
};
