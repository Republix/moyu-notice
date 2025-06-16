import path from 'path'

/**
 * 加载配置
 */
export function loadConfig () {
  const configPath = path.resolve(process.cwd(), './config')

  delete require.cache[require.resolve(configPath)]
  return require(configPath)
}