import axios from 'axios'
import { generateMessage } from './message'
import { loadConfig } from '@/utils'
import { writeLog } from '@/plugins/log'

/**
 * 发送消息到webhook
 * @param {Object} customMessage - 可选的自定义消息内容
 * @returns {Promise}
 */
export async function sendMessage(customMessage = null) {
  // 默认消息内容
  const defaultMessage = {
    msg_type: 'text',
    content: {
      text: generateMessage()
    }
  }

  const message = customMessage || defaultMessage
  const results = []
  
  // 获取最新配置
  const config = loadConfig()
  writeLog('已读取最新配置文件')
  
  // 遍历所有启用的webhook
  for (const subscriber of config.subscribers) {
    if (!subscriber.enable) {
      writeLog(`跳过已禁用的webhook: ${subscriber.remark}`)
      continue
    }
    
    try {
      writeLog(`正在发送消息到webhook: ${subscriber.remark} (${subscriber.hookUrl})`)
      const response = await axios.post(subscriber.hookUrl, message)
      writeLog(`Webhook响应 [${subscriber.remark}]: ${JSON.stringify(response.data)}`)
      results.push({ subscriber, success: true, response: response.data })
    } catch (error) {
      writeLog(`发送webhook消息失败 [${subscriber.remark}]: ${error.message}`)
      results.push({ subscriber, success: false, error: error.message })
    }
  }

  return results
}