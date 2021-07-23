import React ,{ createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const cartLocalStorage = '@RocketShoes:cart'
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = window.localStorage.getItem(cartLocalStorage)
    if (storagedCart) {
      return JSON.parse(storagedCart);
    } else {
      return [];
    }
  });
  const addProduct = async (productId: number) => {
    try {
      const isProduct = cart.find(product => product.id === productId)
      if (isProduct) {
        const [ newAmount ] = cart.filter((product) => productId === product.id)
        const updateAmount = {productId, amount: newAmount.amount + 1}
        updateProductAmount(updateAmount)
      } else {
        const { data } = await api.get(`products/${productId}`)
        data.amount = 1
        const newProduct = [...cart, data]
        setCart(newProduct);
        window.localStorage.setItem(cartLocalStorage, JSON.stringify(newProduct))
      };
    } catch {
      toast.error('Erro na adição do produto')
    };
  };
  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart]
      const isProduct = newCart.findIndex(product => product.id === productId)
      if (isProduct >= 0) {
        newCart.splice(isProduct, 1);
        setCart(newCart);
        window.localStorage.setItem(cartLocalStorage, JSON.stringify(newCart));
      }
      else {
        throw Error()
      }
    } catch {
       toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (!cart.length || amount <= 0) throw Error();
      const newAmouted = amount
      const amountTotal = await api.get(`stock/${productId}`).then(({ data }) => data.amount)
      const error = cart.findIndex((product) => product.id === productId && newAmouted <= amountTotal ) 
      
      if (error === -1) return toast.error('Quantidade solicitada fora de estoque');
      
      else {
        const newCart =  cart.map((product) => product.id === productId ? { ...product, amount: newAmouted } : product);
        setCart(newCart)
        window.localStorage.setItem(cartLocalStorage, JSON.stringify(newCart));
      };
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    };
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
