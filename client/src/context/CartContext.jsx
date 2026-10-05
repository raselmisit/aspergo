import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aspergo_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('aspergo_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product, quantity = 1, openDrawer = true) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      const effectivePrice = product.discount_price || product.price;

      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            title: product.title,
            slug: product.slug,
            image: product.image,
            price: product.price,
            discount_price: product.discount_price,
            unit_price: effectivePrice,
            quantity,
            stock: product.stock,
          },
        ];
      }
    });

    if (openDrawer) {
      setCartDrawerOpen(true);
    }
  };

  // Instant 1-Click Buy Now for a single product without affecting full cart
  const buyNowDirect = (product, quantity = 1) => {
    const effectivePrice = product.discount_price || product.price;
    setDirectCheckoutItem({
      id: product.id,
      product_id: product.id,
      title: product.title,
      image: product.image,
      unit_price: effectivePrice,
      quantity,
    });
    setCheckoutModalOpen(true);
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        buyNowDirect,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDrawerOpen,
        setCartDrawerOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        directCheckoutItem,
        setDirectCheckoutItem,
        orderSuccessData,
        setOrderSuccessData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
