interface res {
  success: boolean;
  host: string;
  audioId: string;
  audioStatusUrl: string;
  wavDownloadUrl: string;
  mp3DownloadUrl: string;
}

let txt: string = "";
let speaker: number = 0;

export class fetchVoiceAPI {
  constructor(inputTxt: string, speakerId: number) {
    txt = inputTxt;
    speaker = speakerId;
  }

  public async playVoice(): Promise<string | undefined> {
    const url = `https://api.tts.quest/v3/voicevox/synthesis?text=${txt}&speaker=${speaker}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const data = await fetchData(url, headers);
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

const fetchData = async (url: string, headers: HeadersInit): Promise<res> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("response error");
  }
  const data: res = await response.json();
  return data;
};
