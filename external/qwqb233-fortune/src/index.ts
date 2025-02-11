/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-02-06 17:37:59
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2025-02-10 14:01:12
 * @FilePath: \koishi_test1\external\qwqb233-fortune\src\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Context, Schema } from 'koishi'
import { format } from 'path';
import * as fs from 'fs';
import * as util from 'util';
import { CronJob } from 'cron';

const filePath = './fortune.json'

export const name = 'qwqb233-fortune'

var star: string[];
star = [
  "你今日的运势是：\n 凶\n  \u2606 \u2606 \u2606 \u2606 \u2606 \u2606 \u2606 \u2606\n 凶多吉少，祸从天降，大难临头，灾祸连连。",
  "你今日的运势是：\n 咎\n  \u2605 \u2606 \u2606 \u2606 \u2606 \u2606 \u2606 \u2606\n 小灾小难，祸不单行，事与愿违，多事之秋。",
  "你今日的运势是：\n 厉\n  \u2605 \u2605 \u2606 \u2606 \u2606 \u2606 \u2606 \u2606\n 危机四伏，险象环生，风雨飘摇，岌岌可危。",
  "你今日的运势是：\n 吝\n  \u2605 \u2605 \u2605 \u2606 \u2606 \u2606 \u2606 \u2606\n 艰难困苦，举步维艰，进退维谷，困难重重。",
  "你今日的运势是：\n 悔\n  \u2605 \u2605 \u2605 \u2605 \u2606 \u2606 \u2606 \u2606\n 悔不当初，追悔莫及，事后悔悟，悔过自新。",
  "你今日的运势是：\n 无咎\n\u2605 \u2605 \u2605 \u2605 \u2605 \u2606 \u2606 \u2606\n 平安无事，风平浪静，安然无恙，无灾无难。",
  "你今日的运势是：\n 吉\n  \u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2606 \u2606\n 吉祥如意，平安顺遂，好事成双，福寿安康。",
  "你今日的运势是：\n 上吉\n\u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2606\n 吉星高照，顺风顺水，心想事成，福禄双全。",
  "你今日的运势是：\n 元吉\n\u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2605 \u2605\n 大吉大利，福星高照，万事亨通，吉祥如意。",
]

var userMap = new Map();
var fortuneNumber = 0;

// 添加定时任务，每日0点清空文件内容
const job = new CronJob('0 0 * * *', async () => {
  try {
    await writeJsonFile(filePath, []);
    console.log('每日0点清空文件内容成功');
  } catch (err) {
    console.error('清空文件内容时发生错误:', err);
  }
}, null, true, 'Asia/Shanghai'); // 根据你的时区设置
job.start();

async function fortune(randomNumber: number)
{
  //凶类
  if (randomNumber >= 0 && randomNumber <= 20) {
    if (randomNumber >= 0 && randomNumber <= 2) {
      //凶
      fortuneNumber = 0;
    }
    else if (randomNumber >= 3 && randomNumber <= 9) {
      //咎
      fortuneNumber = 1;
    }
    else if (randomNumber >= 10 && randomNumber <= 20) {
      //厉
      fortuneNumber = 2;
    }
  }
  //平类
  else if (randomNumber >= 21 && randomNumber <= 71) {
    if (randomNumber >= 21 && randomNumber <= 34) {
      //吝
      fortuneNumber = 3;
    }
    else if (randomNumber >= 35 && randomNumber <= 48) {
      //悔
      fortuneNumber = 4;
    }
    else if (randomNumber >= 49 && randomNumber <= 71) {
      //无咎
      fortuneNumber = 5;
    }
  }
  //吉类
  else if (randomNumber >= 72 && randomNumber <= 100) {
    if (randomNumber >= 72 && randomNumber <= 86) {
      //吉
      fortuneNumber = 6;
    }
    else if (randomNumber >= 87 && randomNumber <= 94) {
      //上吉
      fortuneNumber = 7;
    }
    else if (randomNumber >= 95 && randomNumber <= 100) {
      //元吉
      fortuneNumber = 8;
    }
  }
  return fortuneNumber;
}

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

async function writeJsonFile(FilePath: string, data: any)
{
  
  const jsonData = JSON.stringify(data, null, 2);
  console.log("向"+FilePath+"写入数据："+jsonData)
  await writeFile(FilePath, jsonData);
}

async function readJsonFile(FilePath: string)
{
  const jsonData = await readFile(FilePath, 'utf8');
  const data = JSON.parse(jsonData);
  if(!Array.isArray(data))
  {
    return [];
  }
  return JSON.parse(jsonData);
}

//使用id判断是否已经生成过运势
async function objIsExist(filePath: string,compData: string)
{
  try{
    const data: any[] = await readJsonFile(filePath);
    for(const obj of data)
    {
      if(JSON.stringify(obj.userId) === JSON.stringify(compData))
      {
        return true;
      }
    }
    return false;
  }
  catch(err)
  {
    console.log(err)
    return false;
  }
}


export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  // 添加一个命令来生成随机数
  ctx.command('今日运势', '查看运势')
    .action(async ({ session }) => {
      const randomNumber = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
      var fortuneNumber = 0;
      console.log(randomNumber + '\n' + session.userId)
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('文件不存在，创建文件')
          fs.writeFile(filePath, '[]', (err) => {
            if (err) throw err;
            console.log('文件创建成功')
          })
        }
      })
      const exists = await objIsExist(filePath,session.username);
      const data: any[] = await readJsonFile(filePath);
      if(exists)
      {
        console.log('存在数据')
        for(const obj of data)
        {
          console.log("查找用户:"+session.userId)
          if(JSON.stringify(obj.userId) === JSON.stringify(session.userId))
          {
            fortuneNumber = obj.fortuneNumber;
            console.log("找到用户:"+session.userId+"的运势:"+fortuneNumber)
            break;
          }
        }
      }
      else
      {
        fortuneNumber = await fortune(randomNumber);
        data.push({userId:session.userId,fortuneNumber:fortuneNumber})
        console.log("写入数据："+JSON.stringify(data))
        await writeJsonFile(filePath,data);
        console.log('写入文件成功')
      }
      const testData: any[] =await readJsonFile(filePath) 
      console.log(testData)
      session.send('\n'+star[fortuneNumber])
    })
}
