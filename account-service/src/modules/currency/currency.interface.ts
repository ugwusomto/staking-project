// src/domain/currency.model.ts
export interface Currency {
  id: string;           
  name: string;         
  symbol: string;       
  chainId: number;      
  decimals: number;
  isNative: boolean;    
}
