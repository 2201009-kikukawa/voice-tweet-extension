import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import * as https from "https";
import * as http from "http";

export class AudioPlayer {
  private static tempDir = path.join(os.tmpdir(), "vscode-voice-extension");

  static async init() {
    // 一時ディレクトリを作成
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  static async playFromUrl(audioUrl: string): Promise<void> {
    try {
      // 音声ファイルをダウンロード
      const buffer = await this.downloadFile(audioUrl);

      // 一時ファイルに保存
      const fileName = `voice_${Date.now()}.${this.getFileExtension(audioUrl)}`;
      const filePath = path.join(this.tempDir, fileName);
      fs.writeFileSync(filePath, buffer);

      // プラットフォーム別に音声再生
      await this.playFile(filePath);

      // 再生後に一時ファイルを削除（少し遅延させる）
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);
    } catch (error) {
      console.error("Audio playback failed:", error);
      vscode.window.showErrorMessage(`音声再生に失敗しました: ${error}`);
    }
  }

  private static downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith("https:") ? https : http;

      protocol
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch audio: ${response.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () => resolve(Buffer.concat(chunks)));
          response.on("error", reject);
        })
        .on("error", reject);
    });
  }

  private static getFileExtension(url: string): string {
    if (url.includes(".mp3")) { return "mp3"; }
    if (url.includes(".wav")) { return "wav"; }
    return "mp3"; // デフォルト
  }

  private static async playFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const platform = os.platform();
      let command: string;

      switch (platform) {
        case "win32":
          command = `powershell -Command "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
          break;
        case "darwin":
          command = `afplay "${filePath}"`;
          break;
        case "linux":
          command = `aplay "${filePath}" || paplay "${filePath}"`;
          break;
        default:
          reject(new Error(`Unsupported platform: ${platform}`));
          return;
      }

      exec(command, (error) => {
        if (error) {
          console.error(`Audio playback error: ${error}`);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  static cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}
