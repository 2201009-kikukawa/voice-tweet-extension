interface res {
  success: boolean;
  host: string;
  audioId: string;
  audioStatusUrl: string;
  wavDownloadUrl: string;
  mp3DownloadUrl: string;
}

export class fetchVoiceAPI {
  private static txt = "";
  private static speaker = 0;

  constructor(inputTxt: string, speakerId: number) {
    fetchVoiceAPI.txt = inputTxt;
    fetchVoiceAPI.speaker = speakerId;
  }

  public async playVoice(): Promise<string | undefined> {
    // テキストをURLエンコードして安全にパラメータとして送信
    const encodedText = encodeURIComponent(fetchVoiceAPI.txt);
    const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${encodedText}&speaker=${fetchVoiceAPI.speaker}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    // リトライ機能付きでAPI呼び出し
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`音声API呼び出し (試行 ${attempt}/3): ${url}`);
        const data = await fetchData(url, headers);
        if (data.success && data.wavDownloadUrl) {
          console.log(`音声URL取得成功: ${data.wavDownloadUrl}`);

          // 音声ファイルの準備を待つ
          console.log("音声ファイルの準備を待機中...");
          await new Promise(resolve => setTimeout(resolve, 2000));

          // URLが有効かチェック
          const isUrlValid = await this.validateAudioUrl(data.wavDownloadUrl);
          if (isUrlValid) {
            return data.wavDownloadUrl;
          } else {
            console.warn(`音声URLが無効です (試行 ${attempt}/3): ${data.wavDownloadUrl}`);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } else {
          console.warn(`音声データの取得に失敗しました (試行 ${attempt}/3):`, data);
          if (attempt === 3) {
            return undefined;
          }
        }
      } catch (error) {
        console.error(`APIエラー (試行 ${attempt}/3)：`, error);
        if (attempt === 3) {
          return undefined;
        }
        // 1秒待機してリトライ
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return undefined;
  }

  private async validateAudioUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const protocol = url.startsWith("https:") ? require("https") : require("http");

      const request = protocol.request(url, { method: 'HEAD' }, (response: any) => {
        console.log(`URL検証レスポンス: ${response.statusCode} ${response.statusMessage}`);
        resolve(response.statusCode === 200);
      });

      request.on('error', (error: any) => {
        console.error(`URL検証エラー: ${error}`);
        resolve(false);
      });

      request.setTimeout(10000, () => {
        console.warn("URL検証タイムアウト");
        request.destroy();
        resolve(false);
      });

      request.end();
    });
  }
}

const fetchData = async (url: string, headers: HeadersInit): Promise<res> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`HTTP Error ${response.status}: ${response.statusText}`);
    console.error(`Response body: ${errorText}`);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};
