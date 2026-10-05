import React from 'react';
import { CheckCircle2, ShoppingBag, Truck, MessageSquare, ArrowRight, Printer } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function OrderSuccessModal({ onTrackOrder, onContinueShopping }) {
  const { orderSuccessData, setOrderSuccessData } = useCart();

  if (!orderSuccessData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 sm:p-8 text-center my-8">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900">
          অভিনন্দন! আপনার অর্ডার সফল হয়েছে 🎉
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Thank you, <strong>{orderSuccessData.customer_name}</strong>! Your ASPER GO order has been placed.
        </p>

        {/* Order Number Box */}
        <div className="my-5 p-4 bg-red-50/80 rounded-2xl border border-red-200">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Order Tracking Number
          </div>
          <div className="text-2xl font-black text-[#C8102E] tracking-widest mt-0.5">
            {orderSuccessData.order_number}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Total: <strong>৳{orderSuccessData.total_amount}</strong> ({orderSuccessData.payment_method?.toUpperCase()})
          </div>
        </div>

        {/* Delivery Timeline Notice */}
        <div className="text-left bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-gray-600 mb-6">
          <div className="flex items-center space-x-2 font-semibold text-gray-800">
            <Truck className="w-4 h-4 text-[#C8102E]" />
            <span>ডেলিভারি ঠিকানা: {orderSuccessData.delivery_address}</span>
          </div>
          <p className="text-[11px] text-gray-500">
            আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করে পার্সেলটি পাঠিয়ে দিবে।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              const orderNum = orderSuccessData.order_number;
              setOrderSuccessData(null);
              onTrackOrder(orderNum);
            }}
            className="w-full bg-asper-gradient text-white py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg hover:opacity-95 transition cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>অর্ডারের বর্তমান অবস্থা ট্র্যাক করুন (Track Order)</span>
          </button>

          <a
            href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello ASPER GO, I placed order ${orderSuccessData.order_number} for total ৳${orderSuccessData.total_amount}. Please confirm.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে যোগাযোগ করুন (WhatsApp Support)</span>
          </a>

          <button
            onClick={() => {
              setOrderSuccessData(null);
              onContinueShopping();
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            আরও কেনাকাটা করুন (Continue Shopping)
          </button>
        </div>
      </div>
    </div>
  );
}
