declare module 'grenache-nodejs-http' {
  export class PeerRPCServer {
    constructor(link: any, options?: any);
    init(): void;
    transport(type: 'server' | 'client'): any;
  }

  export class PeerRPCClient {
    constructor(link: any, options?: any);
    init(): void;
    request(
      service: string,
      payload: any,
      options: { timeout: number },
      callback: (err: any, data: any) => void
    ): void;
  }
}
