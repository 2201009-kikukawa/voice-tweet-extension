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
    const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${fetchVoiceAPI.txt}&speaker=${fetchVoiceAPI.speaker}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const data = await fetchData(url);
      if (data.success && data.wavDownloadUrl) {
        return data.wavDownloadUrl;
      } else {
        console.warn("音声データの取得に失敗しました");
        return undefined;
      }
    } catch (error) {
      console.error("APIエラー：", error);
      return undefined;
    }
  }
}

const fetchData = async (url: string): Promise<res> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("response error");
  }

  return await response.json();
};
