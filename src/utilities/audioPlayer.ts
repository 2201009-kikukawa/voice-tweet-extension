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
      // URLの検証
      if (!audioUrl || audioUrl.trim() === "") {
        throw new Error("音声URLが空です");
      }

      try {
        new URL(audioUrl);
      } catch (urlError) {
        throw new Error(`無効な音声URL: ${audioUrl}`);
      }

      console.log(`音声再生開始: ${audioUrl}`);

      // 音声ファイルをダウンロード
      const buffer = await this.downloadFile(audioUrl);

      // 一時ファイルに保存
      const fileName = `voice_${Date.now()}.wav`;
      const filePath = path.join(this.tempDir, fileName);
      fs.writeFileSync(filePath, buffer);

      // プラットフォーム別に音声再生
      await this.playFile(filePath);
      console.log("音声再生が完了しました");

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
      console.log(`音声ファイルダウンロード開始: ${url}`);

      const downloadWithRedirect = (downloadUrl: string, redirectCount = 0) => {
        if (redirectCount > 5) {
          reject(new Error("Too many redirects"));
          return;
        }

        const protocol = downloadUrl.startsWith("https:") ? https : http;

        const request = protocol
          .get(downloadUrl, {
            headers: {
              'User-Agent': 'VSCode-Voice-Extension/1.0.0'
            }
          }, (response) => {
            console.log(`ダウンロードレスポンス: ${response.statusCode} ${response.statusMessage}`);
            console.log(`Headers:`, response.headers);

            // リダイレクトの処理
            if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
              const location = response.headers.location;
              if (location) {
                console.log(`リダイレクト先: ${location}`);
                downloadWithRedirect(location, redirectCount + 1);
                return;
              } else {
                reject(new Error(`Redirect response without location header: ${response.statusCode}`));
                return;
              }
            }

            if (response.statusCode !== 200) {
              const errorMessage = `Failed to fetch audio: ${response.statusCode} ${response.statusMessage}`;
              console.error(errorMessage);
              console.error(`URL: ${downloadUrl}`);
              reject(new Error(errorMessage));
              return;
            }

            const chunks: Buffer[] = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => {
              console.log(`音声ファイルダウンロード完了: ${chunks.length} chunks received`);
              const buffer = Buffer.concat(chunks);
              console.log(`Total buffer size: ${buffer.length} bytes`);

              // 空のファイルチェック
              if (buffer.length === 0) {
                reject(new Error("Downloaded file is empty"));
                return;
              }

              resolve(buffer);
            });
            response.on("error", (error) => {
              console.error(`Download stream error: ${error}`);
              reject(error);
            });
          })
          .on("error", (error) => {
            console.error(`HTTP request error: ${error}`);
            reject(error);
          });

        // タイムアウト設定（30秒）
        request.setTimeout(30000, () => {
          console.error("Download timeout");
          request.destroy();
          reject(new Error("Download timeout"));
        });
      };

      downloadWithRedirect(url);
    });
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
