import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = (productId: number) => {
    return cart.find((product) => product.id === productId) 
  }

  useEffect(() => {
    async function loadProducts() {
     const { data } = await api.get('products')
      setProducts(data)
    }
    
    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {products && products.map(product => (
        <li key={product.id}>
          <img src={product.image } alt={ product.title } />
          <strong>{ product.title }</strong>
          <span>{
            formatPrice(product.price)
          }</span>
        <button
          type="button"
          data-testid="add-product-button"
          onClick={() => handleAddProduct(product.id)}
        >
          <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
            { cartItemsAmount(product.id)?.amount ?  cartItemsAmount(product.id)?.amount : '0' }
          </div>

          <span>ADICIONAR AO CARRINHO</span>
        </button>
      </li>
      ))}
    </ProductList>
  );
};

export default Home;
