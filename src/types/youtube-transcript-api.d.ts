declare module 'youtube-transcript-api' {
  interface TranscriptSegment {
    text: string;
    start?: number;
    duration?: number;
  }

  interface AxiosOptions {
    headers?: Record<string, string>;
    [key: string]: string | Record<string, string> | undefined;
  }

  class TranscriptClient {
    ready: Promise<void>;
    constructor(AxiosOptions?: AxiosOptions);
    getTranscript(id: string, config?: AxiosOptions): Promise<TranscriptSegment[]>;
    bulkGetTranscript(ids: string[], config?: AxiosOptions): Promise<TranscriptSegment[][]>;
  }

  export default TranscriptClient;
}
