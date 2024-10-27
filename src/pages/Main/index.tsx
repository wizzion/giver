import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';
import { useMainButton } from '@/hooks/useMainButton';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import { useAppState } from '@/context/app-context.tsx';
import styles from './styles.module.scss';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  language?: string;
  author?: string;
  year?: number;
  quantity?: number; // Optional field for cart handling
}

const Main = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { cart } = useAppState();
  const address = useTonAddress();
  const { open } = useTonConnectModal();

  const handleViewOrder = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleConnectWallet = useCallback(() => {
    open();
  }, [open]);

  const mainButton = useMainButton(
    address
      ? { text: 'View order', onClick: handleViewOrder }
      : { text: 'Connect wallet', onClick: handleConnectWallet }
  );

  useEffect(() => {
    if (Object.keys(cart).length && !mainButton.isVisible) {
      mainButton.show();
      return;
    }
    if (!Object.keys(cart).length) {
      mainButton.hide();
    }
  }, [cart, mainButton, address]);

useEffect(() => {
  // Fetch the configuration file first
  fetch('/antik/config.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load config');
      }
      return response.json();
    })
    .then((config) => {
      const catalogueUrl = config.catalogueUrl;
      const timestamp = new Date().getTime(); // Unique value to prevent caching
      return fetch(`${catalogueUrl}?t=${timestamp}`);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load book data');
      }
      return response.json();
    })
    .then((data) => {
      setProducts(data);
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
}, []);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.wrapper}>
      <Header />
      {products.map((product) => (
        <ProductCard
          product={cart[product.id] ? { ...cart[product.id], quantity: cart[product.id].quantity || 0 } : { ...product, quantity: 0 }}
          key={product.id}
        />
      ))}
    </div>
  );
};

export default Main;

