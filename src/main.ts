import { exec } from 'child_process';
import readline from 'readline';
import fs from 'fs';

import baron from '../sequences/baron.json';
import drake from '../sequences/drake.json';

const baronOffset = -6.65;
const drakeOffset = -5;

const executeCommand = async (cmd: string) => {
  return new Promise(resolve => {
      exec(cmd, (error, stdout, stderr) => {
          resolve(stdout);
      });
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mapSequence = (sequence: any, startGameTime: number) => {
  const newSequence: any = {};

  Object.keys(sequence).forEach(key => {
    const frames = sequence[key];
    const templateStartTime = frames[0].time;

    const mappedFrames = frames.map((frame: any, index: number) => {
      if (index === 0) {
        return {
          ...frame,
          time: startGameTime
        }
      } else {
        const relativeTimeAfterStart = frame.time - templateStartTime;
        return {
          ...frame,
          time: startGameTime + relativeTimeAfterStart
        }
      }
    });

    newSequence[key] = mappedFrames;
  });

  return newSequence;
};

const main = async () => {
  // Find out where the ingame API is
  /* const gameInfoText = await executeCommand("powershell.exe \"Get-NetTCPConnection -OwningProcess $(Get-Process 'League of Legends').Id | Where-Object { $_.LocalAddress -EQ '127.0.0.1' -And $_.RemoteAddress -EQ '0.0.0.0' } | Select-Object LocalAddress,LocalPort | ConvertTo-Json\"") as string;
    
  if (gameInfoText === "") {
      console.log("No game found running.");
      return null;
  }
  const gameInfo = JSON.parse(gameInfoText);
  console.log(gameInfo);

  const response = await axios({
    method:"get",
    url: `https://${gameInfo.LocalAddress}:${gameInfo.LocalPort}/liveclientdata/allgamedata`
  });

  const events = response.data.events;
  console.log(events);

  // Find relevant events
  const dragonTakes = events;
  const baronTakes = events;*/

  rl.question('B = Baron, D = Drake > ', (answer) => {
    let sequence: any;
    let offset = 0;
    let name = '';
    if (answer === 'B') {
      sequence = baron;
      offset = baronOffset;
      name = 'Baron';
    } else {
      sequence = drake;
      offset = drakeOffset;
      name = 'Drake';
    }

    // Ask for time
    rl.question('Respawn time? > ', (timeInput) => {
      const split = timeInput.split(':');
      const minutes = parseInt(split[0]);
      const seconds = parseInt(split[1]);

      const gameTime = seconds + (minutes * 60);

      console.log(`Respawn game time: ${gameTime}`);

      const mappedSequence = mapSequence(sequence, gameTime + offset);

      fs.writeFileSync(`C://Users/Lars/Documents/LeagueDirector/sequences/Adapted - ${name} - Start ${gameTime + offset}.json`, JSON.stringify(mappedSequence, null, 2));
      console.log("File written!");
      rl.close();
    });
  });
}

main().catch(e => {
  console.log(e);
});