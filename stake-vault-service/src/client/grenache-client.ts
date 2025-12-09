import { PeerRPCClient } from "grenache-nodejs-http";
import Link from "grenache-nodejs-link";

export class GrenacheClient {
  private static instance: PeerRPCClient;
  private static link: Link;

  // Initialize the link and peer only once
  private static init() {
    if (!this.link) {
      this.link = new Link({ grape: process.env.GRAPE_HOST });
      this.link.start();
    }

    if (!this.instance) {
      this.instance = new PeerRPCClient(this.link, {});
      this.instance.init();
    }
  }

  // make request to a service
  public static request(
    serviceKey: string,
    payload: any,
    timeout = 10000
  ): Promise<any> {
    this.init();
    return new Promise((resolve, reject) => {
      this.instance.request(serviceKey, payload, { timeout }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}
