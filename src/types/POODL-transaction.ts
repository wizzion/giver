import { Address } from '@ton/core';

export type POODLTransaction = {
  hash: string;
  orderId: string;
  fromAddress: Address;
  POODLAmount: bigint;
  timestamp: number;
  gasUsed: bigint;
  status: 'succeeded' | 'failed';
}
