import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { JettonMaster } from '@ton/ton';
import { useMainButton } from '@/hooks/useMainButton';
import { useTonConnectModal } from '@tonconnect/ui-react';
import { useAppState } from '@/context/app-context.tsx';
import CartItem from '@/components/CartItem';
import { useBackButton } from '@/hooks/useBackButton.ts';
import { useTonConnect } from '@/hooks/useTonConnect.ts';
import { JettonWallet } from '@/wrappers/JettonWallet.ts';
import { calculatePOODLAmount } from '@/helpers/common-helpers.ts';
import { INVOICE_WALLET_ADDRESS, POODL_MASTER_ADDRESS } from '@/constants/common-constants.ts';
import Header from '@/components/Header';
import { EmptyCart } from '@/constants/icons.tsx';
import { JETTON_TRANSFER_GAS_FEES } from '@/constants/fees.constants.ts';
import styles from './styles.module.scss';

const Cart = () => {
  const { cart, clearCart, removeProduct } = useAppState();
  const navigate = useNavigate();
  const { open } = useTonConnectModal();
  const { sender, walletAddress, tonClient } = useTonConnect();

  const isEmptyCart = !Object.keys(cart).length;

  useBackButton();
  const totalCost = (Math.round(Object.values(cart).reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0) * 100) / 100);

  // Generate comment from cart items
  const comment = Object.values(cart)
    .map((item) => item.name)
    .join(', ');

  const handleCompletePayment = useCallback(async () => {
    try {
      if (!tonClient || !walletAddress) return;

      const jettonMaster = tonClient.open(JettonMaster.create(POODL_MASTER_ADDRESS));
      const usersPOODLAddress = await jettonMaster.getWalletAddress(walletAddress);

      // creating and opening jetton wallet instance.
      const jettonWallet = tonClient.open(JettonWallet.createFromAddress(usersPOODLAddress));

      await jettonWallet.sendTransfer(sender, {
        fwdAmount: 1n,
        comment: comment, // Use the concatenated comment instead of orderId
        jettonAmount: calculatePOODLAmount(totalCost),
        toAddress: INVOICE_WALLET_ADDRESS,
        value: JETTON_TRANSFER_GAS_FEES,
      });
      navigate('/transaction-sent');
      clearCart();
      console.log(`See transaction at https://testnet.tonviewer.com/${usersPOODLAddress.toString()}`);
    } catch (error) {
      console.log('Error during transaction check:', error);
    }
  }, [tonClient, walletAddress, sender, comment, totalCost, clearCart, navigate]);

  const handleConnectWallet = useCallback(() => {
    open();
  }, [open]);

  useMainButton(walletAddress
    ? (isEmptyCart ? { text: 'Go to shop', onClick: () => navigate('/') }
      : { text: 'Complete payment', onClick: handleCompletePayment })
    : { text: 'Connect wallet', onClick: handleConnectWallet });

  return (
    <div className={styles.wrapper}>
      <Header />
      {isEmptyCart
        ? (<div className={styles.isEmpty}>
          <EmptyCart />
          <h4>Cart is empty</h4>
        </div>)
        : (<>
          {Object.values(cart).map(product => (
            <CartItem
              product={cart[product.id]}
              key={product.id}
              onRemoveProduct={removeProduct}
            />
          ))}
          <div>Total: {totalCost} POODL</div>
        </>)}
    </div>
  );
};

export default Cart;

