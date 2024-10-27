import { TProduct } from '@/types/common-types.ts';
import Button from '@/components/Button';
import styles from './styles.module.scss';

type Props = {
  product: TProduct;
  onRemoveProduct: (product: TProduct) => void;
}

const CartItem = ({ product, onRemoveProduct }: Props) => {
  const { image, name, price } = product;

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <img className={styles.image} src={image} alt={name} />
        <div>
          <h5>{name}</h5>
          <p>{price} <img className={styles.poodlImage} src="https://giver.eu/antik/poodl.webp" alt="POODL" /> POODL</p>
        </div>
      </div>
      <Button className={styles.removeButton} onClick={() => onRemoveProduct(product)}>Remove</Button>
    </div>
  );
};

export default CartItem;

