import { TProduct } from '@/types/common-types.ts';
import { useAppState } from '@/context/app-context.tsx';
import styles from './styles.module.scss';

type Props = {
  product: TProduct;
}

const ProductCard = ({ product }: Props) => {
  const { cart, addProduct, removeProduct } = useAppState();
  const { id, image, name, description, price } = product;

  // Determine if the product is in the cart
  const isInCart = id in cart;

  // Handle click to toggle product in the cart
  const handleClick = () => {
    if (isInCart) {
      removeProduct(product);
    } else {
      addProduct(product);
    }
  };

  return (
    <div className={`${styles.card} ${isInCart ? styles.selected : ''}`} onClick={handleClick}>
      <div className={styles.content}>
        <h5>{name}</h5>
        <img className={styles.image} src={image} alt={name} />
        <p>{price} <img className={styles.poodlImage} src="https://giver.eu/antik/poodl.webp" alt="POODL" /></p>
        <p className={styles.description}>{description}</p>
      </div>
      {isInCart && <div className={styles.inCartLabel}>In Cart</div>}
    </div>
  );
};

export default ProductCard;
