import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, Phone, MapPin, Calendar } from 'lucide-react';
import { api } from '../api';

export default function OrderTracker({ initialQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  React.useEffect(() => {
    if (initialQuery) {
      handleSearch(null, initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (e, directQuery) => {
    if (e) e.preventDefault();
    const q = directQuery || searchQuery;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.trackOrder(q.trim());
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || 'কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে সঠিক Order ID বা ফোন নম্বর দিন।');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-red-50 text-[#C8102E] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          <Truck className="w-4 h-4" />
          <span>Real-time Parcel Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Track Your ASPER GO Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
          আপনার অর্ডারের বর্তমান অবস্থা জানতে Order ID (যেমন: AG-123456) অথবা আপনার মোবাইল নম্বর দিয়ে সার্চ করুন
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={(e) => handleSearch(e)} className="max-w-xl mx-auto mb-8">
        <div className="flex items-center border-2 border-[#C8102E] rounded-2xl overflow-hidden bg-white shadow-lg focus-within:ring-2 focus-within:ring-red-400">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Order ID (AG-xxxxxx) or Mobile Number..."
            className="w-full py-3.5 px-4 text-sm text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-asper-gradient text-white px-6 py-3.5 font-bold text-sm flex items-center space-x-2 hover:opacity-95 transition disabled:opacity-50"
          >
            {loading ? <span>Searching...</span> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center justify-center space-x-2 mb-6 text-center">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const currentStep = getStatusStep(order.status);
          const isCancelled = order.status === 'cancelled';

          return (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden p-6 sm:p-8">
              
              {/* Order Meta Header */}
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg sm:text-xl font-black text-gray-900">
                      Order #{order.order_number}
                    </span>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>Payment: <strong>{order.payment_method?.toUpperCase()}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Amount</div>
                  <div className="text-xl font-black text-[#C8102E]">৳{order.total_amount}</div>
                </div>
              </div>

              {/* Visual Progress Steps (If not cancelled) */}
              {!isCancelled ? (
                <div className="py-8">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-[#C8102E] -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    ></div>

                    {/* Step 1: Placed */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition ${
                        currentStep >= 1 ? 'bg-asper-gradient text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold mt-2 text-gray-800">Order Placed</div>
                      <div className="text-[10px] text-gray-400 hidden sm:block">অর্ডার গৃহীত হয়েছে</div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition ${
                        currentStep >= 2 ? 'bg-asper-gradient text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold mt-2 text-gray-800">Processing</div>
                      <div className="text-[10px] text-gray-400 hidden sm:block">প্যাকিং হচ্ছে</div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition ${
                        currentStep >= 3 ? 'bg-asper-gradient text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold mt-2 text-gray-800">On The Way</div>
                      <div className="text-[10px] text-gray-400 hidden sm:block">কুরিয়ারে আছে</div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition ${
                        currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <PackageCheck className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold mt-2 text-gray-800">Delivered</div>
                      <div className="text-[10px] text-gray-400 hidden sm:block">ডেলিভারি সম্পন্ন</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-red-600 font-bold text-sm bg-red-50 rounded-2xl my-4">
                  ❌ এই অর্ডারটি বাতিল করা হয়েছে (This order was cancelled)
                </div>
              )}

              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs text-gray-700 mb-6">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#C8102E]" />
                    Shipping Address:
                  </div>
                  <p>{order.customer_name}</p>
                  <p>{order.delivery_address}, {order.district}</p>
                  <p>Phone: {order.customer_phone}</p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="font-bold text-gray-900">Payment Breakdown:</div>
                  <p>Subtotal: ৳{order.subtotal}</p>
                  <p>Delivery Fee: ৳{order.delivery_fee}</p>
                  <p className="font-bold text-[#C8102E]">Grand Total: ৳{order.total_amount}</p>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Items</div>
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-100 text-xs">
                    <div className="flex items-center space-x-3">
                      <img src={item.product_image} alt={item.product_title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <div className="font-bold text-gray-900">{item.product_title}</div>
                        <div className="text-gray-500">Qty: {item.quantity} × ৳{item.unit_price}</div>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">৳{item.total_price}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
