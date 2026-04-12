// src/context/RequestContext.ts
class RequestContext {
  private static instance: RequestContext;
  public token?: string;

  private constructor() {}

  public static getInstance(): RequestContext {
    if (!RequestContext.instance) {
      RequestContext.instance = new RequestContext();
    }
    return RequestContext.instance;
  }

  public setToken(token: string) {
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }
}

export default RequestContext.getInstance();
