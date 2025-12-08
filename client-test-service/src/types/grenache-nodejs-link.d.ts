declare module 'grenache-nodejs-link' {
  interface LinkOptions {
    grape: string;
    [key: string]: any;
  }

  class Link {
    constructor(options: LinkOptions);
    start(): void;
    announce(service: string, port: number, options?: object): void;
    [key: string]: any;
  }

  export default Link;
}
