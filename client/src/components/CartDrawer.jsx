import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatImageUrl } from '../api';

export default function CartDrawer() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartSubtotal, 
    cartDrawerOpen, 
    setCartDrawerOpen, 
    setCheckoutModalOpen,
    setDirectCheckoutItem 
  } = useCart();

  if (!cartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    setDirectCheckoutItem(null); // Full cart checkout
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#1A1A1A] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#C8102E]" />
              <h2 className="text-base font-bold">Shopping Cart ({items.length})</h2>
            </div>

            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Incentive Banner */}
          <div className="bg-red-50 px-4 py-2 text-xs text-red-900 border-b border-red-100 flex items-center justify-between font-medium">
            <span className="flex items-center">
              <Truck className="w-3.5 h-3.5 mr-1 text-[#C8102E]" />
              Express Delivery Across BD
            </span>
            <span className="font-bold text-[#C8102E]">Cash on Delivery</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Looks like you haven't added anything yet. Explore our flash deals and daily essentials!
                </p>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="mt-4 bg-asper-gradient text-white px-5 py-2 rounded-xl text-xs font-bold shadow hover:opacity-95 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 relative group"
                >
                  <img
                    src={formatImageUrl(item.image)}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate" title={item.title}>
                      {item.title}
                    </h4>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-black text-[#C8102E]">
                        ৳{item.unit_price}
                      </span>
                      {item.discount_price && item.price > item.unit_price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ৳{item.price}
                        </span>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-between self-stretch">
                    <span className="text-xs font-black text-gray-900">
                      ৳{item.unit_price * item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-gray-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900">৳{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold text-gray-800">৳60 (Inside Dhaka)</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total (আনুমানিক সর্বমোট):</span>
                  <span className="text-[#C8102E]">৳{cartSubtotal + 60}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-asper-gradient hover-asper-gradient text-white py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-xl hover:shadow-red-900/30 transition cursor-pointer"
              >
                <span>PROCEED TO 1-CLICK CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-gray-400 hover:text-red-500 py-1 transition"
              >
                Empty Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
