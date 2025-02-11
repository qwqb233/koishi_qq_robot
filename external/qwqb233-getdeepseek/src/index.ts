/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-02-06 17:09:20
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-02-11 11:25:30
 * @FilePath: \koishi_test1\external\qwqb233-getdeepseek\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//提示词

import { Context, Schema } from 'koishi'
import OpenAI from "openai";
import mysql from 'mysql2/promise'

//连接数据库koishi
const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'koishi'
}

//连接到数据库，如果数据表不存在创建数据表
export async function connectMysql() {
  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('连接数据库成功，线程id ' + connection.threadId);

    // 创建表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS deepseek_memory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(20) NOT NULL,
        content VARCHAR(255) NOT NULL
      )
    `);

    return connection;
  } catch (error) {
    console.error('连接数据库失败: ' + error.stack);
    throw error;
  }
}

//提示词
const cue_word = "这有一段ai助手与user对话的记忆，你自行判断一下记忆的重要性，选出你认为最不重要的记忆，这些记忆将会被删除，请谨慎考虑。要求直接输出至少一个你认为不重要的记忆的索引（只需输出user的索引，在删除时会将对应的ai助手输出删除），如有多个，按数组方式输出，索引从0开始\n记忆如下:\n";

/*插入数据到数据库
*role: user/assistant
*content: user/assistant的输入内容
*connection: conneciton = await connectMysql()
*/
const insertMemory = async (role: string, content: string, connection: mysql.Connection) => {
  try {
    const [result] = await connection.query(
      'INSERT INTO deepseek_memory (role, content) VALUES (?, ?)',
      [role, content]
    );
    console.log('插入数据成功');
    return result;
  } catch (err) {
    console.error('插入数据失败: ' + err.stack);
    throw err;
  }
}

/*查询数据表
*connection: conneciton = await connectMysql()
*返回数据表所有数据
*/
const getMemory = async (connection: mysql.Connection) => {
  try {
    const [rows] = await connection.query('SELECT * FROM deepseek_memory');
    console.log('查询数据成功');
    return rows;
  } catch (err) {
    console.error('查询数据失败: ' + err.stack);
    throw err;
  }
}


const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  //baseURL: 'http://43.138.129.252:8080',
  //apiKey:'sk-f90ecf1aeb7c4895b206595a7c64ce16'
  apiKey: 'sk-b220e0737cd8447b888fecb1f9f91a3e'
  //tench
  //apiKey: 'sk-7bedbf4e18054236b56450f1af7751c0'
})

//短时记忆
export var memory: any[] = []

//插件名称
export const name = 'qwqb233-getdeepseek'

//插件配置
export interface Config {
  uname?: string
}

//插件配置
export const Config: Schema<Config> = Schema.object({
  uname: Schema.string().description('username').default('qwqb233')
})

//获取短时记忆
export function getTempMemory()
{
  var message : string = "";
  var i = 0;
  var count = 0;
  for (const obj of memory) {
    message += i + "：" +obj.role + "：" + obj.content + "\n";
    count++;
    if(count === 2){i++;count = 0;}
  }
  return message;
}

//输出短时记忆
export function outPutMemory() {
  console.log('info:输出短时记忆：');
  console.log(getTempMemory());
}

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  //连接deepseek_chat并对话
  ctx
    .command('ds <message:text>', 'link to deepseek')
    .action(async (Argv, message) => {
      console.log('info:输入信息：' + message);
      //将信息插入短时记忆
      memory.push(
        { role: "user", content: message.toString() }
      );
      //调用deepseek-chat模型进行对话
      const completion = await openai.chat.completions.create(
        {
          messages: memory,
          model: "deepseek-chat",
        }
      );
      //将对话结果插入短时记忆
      memory.push(
        { role: "assistant", content: completion.choices[0].message.content }
      );
      //输出短时记忆
      outPutMemory();
      console.log('info:completion_id: ' + completion.id)
      //输出对话结果
      Argv.session.send(completion.choices[0].message.content);
    })
    
    //查看短时记忆
    ctx
    .command('ds_memory','查看短时deepseek记忆')
    .action(async (Argv) => {
      Argv.session.send('正在查询短时记忆...');
      outPutMemory();
      const message = getTempMemory();
      Argv.session.send(message);
    })

    //将短时记忆写入数据库
    ctx
    .command('ds_W_memory <num:number>','将deepseek记忆写入数据库,可以使用参数num指定将短时记忆的第几条写入数据库，不使用参数将由deepseek-r1选择需要删除的记忆')
    .action(async (Argv, num = -1) => {
      const connection = await connectMysql();
      console.log('连接数据库成功');
      //不给予参数，由deepseek-r1选择需要删除的记忆
      if(num === -1)
      {
        for(const obj of memory)
        {
          //将短时记忆转换为字符串
          const message = JSON.stringify(memory)
          //调用deepseek-reasoner模型进行判断
          const completion = await openai.chat.completions.create(
            {
              messages:[{role: "user", content: cue_word+message.toString()}],
              model: "deepseek-reasoner",
            }
          );
          //输出对话结果
          Argv.session.send(completion.choices[0].message.content);
          //将对话结果转换为数组
          const arr: any[] = JSON.parse(completion.choices[0].message.content.toString());
          //遍历短时记忆，将重要的记忆写入数据库
          for (var i = 0; i < memory.length; i+=2)
          {
            if(!arr.includes(i))
            {
              await insertMemory(memory[i].role, memory[i].content, connection);
              await insertMemory(memory[i+1].role, memory[i+1].content, connection);
            }
          }
          //关闭连接
          connection.end();
        }
      }
      else
      {
        //给予参数，将指定条短时记忆写入数据库
        const obj = memory[num*2];
        const obj2 = memory[num*2+1];
        await insertMemory(obj.role, obj.content, connection);
        await insertMemory(obj2.role, obj2.content, connection);
      }
    })
    
    //从数据库中读取deepseek记忆
    ctx
    .command('ds_R_memory','从数据库中读取deepseek记忆')
    .action(async (Argv) => {
      Argv.session.send('正在查询数据库长期记忆...');
      const connection = await connectMysql();
      const rows = await getMemory(connection)
      console.log('查询数据成功:'+JSON.stringify(rows));
      Argv.session.send('数据库长期记忆如下：'+JSON.stringify(rows));
      //关闭连接
      connection.end();
    })
}
