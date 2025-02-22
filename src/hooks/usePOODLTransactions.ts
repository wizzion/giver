import { useCallback, useEffect, useRef, useState } from 'react';
import { JettonMaster, TonClient, Transaction } from '@ton/ton';
import { Address } from '@ton/core';
import { isUUID } from '@/helpers/common-helpers.ts';
import { POODLTransaction } from '@/types/POODL-transaction.ts';
import { AccountSubscriptionService } from '@/services/account-subscription.service.ts';
import { INVOICE_WALLET_ADDRESS, POODL_MASTER_ADDRESS } from '@/constants/common-constants.ts';
import { useTonConnect } from '@/hooks/useTonConnect.ts';

function parsePOODLPayload(tx: Transaction): POODLTransaction | undefined {

  try {
    if (tx.inMessage?.info.type !== 'internal' || tx.description.type !== 'generic' || tx.description.computePhase?.type !== 'vm') {
      return;
    }

    const slice = tx.inMessage.body.beginParse();
    const opcode = slice.loadUint(32);
    if (opcode !== 0x178d4519) { // jetton internal transfer
      return;
    }

    slice.loadUint(64);
    const jettonAmount = slice.loadCoins();
    const fromAddress = slice.loadAddress();
    slice.loadAddress();
    slice.loadCoins();
    const forwardPayload = slice.loadMaybeRef();
    if (!forwardPayload) {
      return;
    }

    const payloadSlice = forwardPayload.beginParse();

    const payloadOpcode = payloadSlice.loadUint(32);
    if (payloadOpcode !== 0) {
      return;
    }

    const comment = payloadSlice.loadStringTail();
    if (!isUUID(comment)) {
      return;
    }

    return {
      status: tx.description.computePhase.success ? 'succeeded' : 'failed',
      hash: tx.hash().toString('hex'),
      POODLAmount: jettonAmount,
      gasUsed: tx.totalFees.coins,
      orderId: comment,
      timestamp: tx.inMessage.info.createdAt,
      fromAddress,
    };
  } catch {
    return;
  }
}


export const usePOODLTransactions = (): POODLTransaction[] => {
  const { walletAddress, tonClient } = useTonConnect();
  const [transactions, setTransactions] = useState<POODLTransaction[]>([]);
  const intervalId = useRef<number | null>(null);
  const accountSubscriptionService = useRef<AccountSubscriptionService | null>(null);
  const effectRan = useRef(false); // double render in dev mode

  const launchSubscriptionService = useCallback(async (tonClient: TonClient, walletAddress: Address) => {
    if (!tonClient || !walletAddress) return;
    const jettonMaster = tonClient.open(JettonMaster.create(POODL_MASTER_ADDRESS));
    const address = await jettonMaster.getWalletAddress(INVOICE_WALLET_ADDRESS);
    console.log(walletAddress?.toString());
    accountSubscriptionService.current = new AccountSubscriptionService(tonClient, address, (txs) => {
      const newPOODLTransactions = txs.map(parsePOODLPayload)
        .filter((tx): tx is POODLTransaction => tx?.fromAddress.toString() === walletAddress?.toString());
      setTransactions((oldTxs) => [
        ...newPOODLTransactions,
        ...oldTxs,
      ]);
    });

    intervalId.current = accountSubscriptionService.current.start();
  }, []);

  useEffect(() => {
    if (effectRan.current || !walletAddress || !tonClient) return;
    launchSubscriptionService(tonClient, walletAddress).catch(null);

    return () => {
      effectRan.current = true;
      if (intervalId.current !== null) {
        clearInterval(intervalId.current);
      }
    };
  }, [launchSubscriptionService, tonClient, walletAddress]);

  return transactions;
};
