export interface RPCPayload {
  action: string;
  data?: any;
  user?: {id:string; email:string};
  token?: string;
  requestId?: string;
}

export interface IRPCResponse {
  status: boolean;
  message: string;
  data?: any;
}