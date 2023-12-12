import * as fs from 'fs';
import * as readline from 'readline';
import axios, {AxiosResponse} from 'axios';
import * as validUrl from 'valid-url';
import * as path from 'path';

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response: AxiosResponse<any> = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

export function findAndDownloadUrls(textFilePath: string, outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  const rl = readline.createInterface({
    input: fs.createReadStream(textFilePath),
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const urlRegex = /"?(https?:\/\/[^\s"]+)"?/g;
    let match;
    while ((match = urlRegex.exec(line)) !== null) {
      const url = match[1];
      if (validUrl.isUri(url)) {
        const filename = path.basename(url);
        const outputPath = path.join(outputDir, filename);
        downloadFile(url, outputPath).catch(console.error);
      }
    }
  });

  rl.on('close', () => {
    console.log('Text file successfully processed');
  });
}

// Usage:
findAndDownloadUrls('./bridges.csv', './downloads');
