/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-02-06 16:52:35
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-02-11 11:29:53
 * @FilePath: \koishi_test1\external\qwqb233-firsttest\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Context, Schema } from 'koishi'

export const name = 'qwqb233-firsttest'

export interface Config {
  uname?: string
}

export const Config: Schema<Config> = Schema.object({
  uname: Schema.string().description('用户名').default('qwqb233'),
})

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  ctx
    .command('hello', 'hello world')
    .action((Argv) => {Argv.session.send('hello,'+config.uname.toString()+'!')})
}