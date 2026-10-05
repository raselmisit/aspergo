import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, ShieldCheck, Truck, CreditCard, 
  Phone, MapPin, User, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function FastCheckoutModal() {
  const { 
    items, 
    cartSubtotal, 
    clearCart, 
    checkoutModalOpen, 
    setCheckoutModalOpen, 
    directCheckoutItem, 
    setDirectCheckoutItem,
    setOrderSuccessData 
  } = useCart();

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    delivery_address: user?.address || '',
    district: 'Inside Dhaka',
    delivery_fee: 60,
    payment_method: 'cod', // 'cod' | 'bkash' | 'nagad' | 'rocket'
    trx_id: '',
    notes: ''
  });

  const [settings, setSettings] = useState({
    inside_dhaka_delivery: '60',
    outside_dhaka_delivery: '120',
    bkash_number: '01700000000',
    nagad_number: '01700000000'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_phone: prev.customer_phone || user.phone || '',
        delivery_address: prev.delivery_address || user.address || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res.settings) setSettings(res.settings);
      })
      .catch(console.error);
  }, []);

  if (!checkoutModalOpen) return null;

  // Determine which items are being checked out (Direct item or Cart items)
  const checkoutItems = directCheckoutItem
    ? [{
        product_id: directCheckoutItem.product_id,
        title: directCheckoutItem.title,
        image: directCheckoutItem.image,
        unit_price: directCheckoutItem.unit_price,
        quantity: directCheckoutItem.quantity,
      }]
    : items.map(item => ({
        product_id: item.id,
        title: item.title,
        image: item.image,
        unit_price: item.unit_price,
        quantity: item.quantity
      }));

  const subtotal = directCheckoutItem
    ? directCheckoutItem.unit_price * directCheckoutItem.quantity
    : cartSubtotal;

  const totalAmount = subtotal + Number(formData.delivery_fee);

  const handleDeliveryAreaChange = (area) => {
    const fee = area === 'Inside Dhaka' 
      ? Number(settings.inside_dhaka_delivery || 60) 
      : Number(settings.outside_dhaka_delivery || 120);
    
    setFormData(prev => ({
      ...prev,
      district: area,
      delivery_fee: fee
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন (Please enter your name)');
      return;
    }

    if (!formData.customer_phone.trim() || formData.customer_phone.length < 11) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (Valid 11-digit phone number required)');
      return;
    }

    if (!formData.delivery_address.trim()) {
      setError('অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (Please enter complete address)');
      return;
    }

    if ((formData.payment_method === 'bkash' || formData.payment_method === 'nagad') && !formData.trx_id.trim()) {
      setError('বিকাশ বা নগদ পেমেন্টের জন্য TrxID বা Transaction ID দিন');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        district: formData.district,
        notes: formData.notes,
        payment_method: formData.payment_method,
        trx_id: formData.trx_id,
        delivery_fee: formData.delivery_fee,
        items: checkoutItems,
        user_id: user?.id || null
      };

      const res = await api.createOrder(orderPayload);

      // Clean up cart if cart checkout
      if (!directCheckoutItem) {
        clearCart();
      }
      setDirectCheckoutItem(null);
      setCheckoutModalOpen(false);

      // Open Success Modal
      setOrderSuccessData({
        order_number: res.order_number,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        district: formData.district,
        total_amount: totalAmount,
        payment_method: formData.payment_method,
        items: checkoutItems,
      });

    } catch (err) {
      setError(err.message || 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-asper-dark-gradient text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#C8102E] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                FAST 1-CLICK ORDER
              </span>
              <span className="text-xs text-red-200">ASPER GO EXPRESS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">
              অর্ডার কনফার্ম করুন (Checkout)
            </h2>
            <p className="text-xs text-gray-300">
              নিচের ফর্মটি পূরণ করে অর্ডারটি এখনই কনফার্ম করুন
            </p>
          </div>

          <button
            onClick={() => {
              setCheckoutModalOpen(false);
              setDirectCheckoutItem(null);
            }}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border-l-4 border-[#C8102E] text-red-700 text-xs font-semibold rounded flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5">
          
          {/* Section 1: Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-[#C8102E]" />
              ১. আপনার তথ্য (Customer Information)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  আপনার নাম (Full Name) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. মোঃ সাকিব হাসান"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  মোবাইল নম্বর (Phone Number) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="e.g. 01712345678"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ডেলিভারি এরিয়া (Delivery Area) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDeliveryAreaChange('Inside Dhaka')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    formData.district === 'Inside Dhaka'
                      ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-left">
                    <div>ঢাকার ভিতরে (Inside Dhaka)</div>
                    <div className="text-[10px] text-gray-500 font-normal">24 Hours Delivery</div>
                  </div>
                  <span className="text-sm font-black">৳{settings.inside_dhaka_delivery || 60}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeliveryAreaChange('Outside Dhaka')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    formData.district === 'Outside Dhaka'
                      ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-left">
                    <div>ঢাকার বাইরে (All Bangladesh)</div>
                    <div className="text-[10px] text-gray-500 font-normal">24-48 Hours Delivery</div>
                  </div>
                  <span className="text-sm font-black">৳{settings.outside_dhaka_delivery || 120}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                সম্পূর্ণ ঠিকানা (Full Delivery Address) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                placeholder="বাসার নম্বর, রোড নম্বর, এলাকা, থানা, জেলা উল্লেখ করুন..."
                className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-[#C8102E]" />
              ২. পেমেন্ট পদ্ধতি (Payment Method)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-2 transition ${
                formData.payment_method === 'cod' ? 'border-[#C8102E] bg-red-50 text-[#C8102E]' : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={formData.payment_method === 'cod'}
                  onChange={() => setFormData({ ...formData, payment_method: 'cod' })}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="text-xs font-bold">Cash On Delivery (ক্যাশ অন ডেলিভারি)</div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-2 transition ${
                formData.payment_method === 'bkash' ? 'border-[#C8102E] bg-red-50 text-[#C8102E]' : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="bkash"
                  checked={formData.payment_method === 'bkash'}
                  onChange={() => setFormData({ ...formData, payment_method: 'bkash' })}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="text-xs font-bold">bKash (বিকাশ)</div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center space-x-2 transition ${
                formData.payment_method === 'nagad' ? 'border-[#C8102E] bg-red-50 text-[#C8102E]' : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="nagad"
                  checked={formData.payment_method === 'nagad'}
                  onChange={() => setFormData({ ...formData, payment_method: 'nagad' })}
                  className="text-red-600 focus:ring-red-500"
                />
                <div className="text-xs font-bold">Nagad (নগদ)</div>
              </label>
            </div>

            {/* bKash / Nagad payment guide */}
            {(formData.payment_method === 'bkash' || formData.payment_method === 'nagad') && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 text-xs">
                <p className="font-bold text-gray-800">
                  {formData.payment_method === 'bkash' ? 'বিকাশ সেন্ড মানি বা পেমেন্ট নম্বর:' : 'নগদ সেন্ড মানি নম্বর:'} <span className="text-[#C8102E] font-mono text-sm">{formData.payment_method === 'bkash' ? settings.bkash_number : settings.nagad_number}</span>
                </p>
                <p className="text-gray-600">টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) নিচের বক্সে লিখুন:</p>
                <input
                  type="text"
                  required
                  value={formData.trx_id}
                  onChange={(e) => setFormData({ ...formData, trx_id: e.target.value })}
                  placeholder="e.g. 9K28XA9L"
                  className="w-full text-sm border border-red-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-mono"
                />
              </div>
            )}
          </div>

          {/* Section 3: Order Items & Pricing Summary */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
            <div className="text-xs font-bold text-gray-700 uppercase mb-2">Order Items ({checkoutItems.length})</div>
            
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {checkoutItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    <span className="font-semibold text-gray-800 truncate">{item.title} (x{item.quantity})</span>
                  </div>
                  <span className="font-bold text-gray-900 ml-2">৳{item.unit_price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge ({formData.district}):</span>
                <span>৳{formData.delivery_fee}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#C8102E] pt-1 border-t border-gray-300">
                <span>সর্বমোট (Total Amount):</span>
                <span>৳{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-asper-gradient hover-asper-gradient text-white py-4 px-6 rounded-2xl font-black text-base shadow-xl hover:shadow-red-900/40 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>অর্ডার প্রসেস হচ্ছে...</span>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current" />
                <span>অর্ডার কনফার্ম করুন - ৳{totalAmount}</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-500">
            🔒 ১০০% নিরাপদ চেকআউট | কোনো অগ্রিম পেমেন্ট ছাড়াই ক্যাশ অন ডেলিভারিতে অর্ডার করুন
          </p>
        </form>
      </div>
    </div>
  );
}
