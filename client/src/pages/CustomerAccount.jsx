import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Phone, Mail, Clock, Truck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function CustomerAccount({ onTrackOrder }) {
  const { user, updateProfile, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditMode(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl text-center shadow-lg border border-gray-100">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-800">Please sign in</h2>
        <p className="text-xs text-gray-500 mt-1">Sign in to view your orders and update your address</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* User Banner Header */}
      <div className="bg-asper-dark-gradient rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-asper-gradient flex items-center justify-center text-white text-2xl font-black shadow-lg border-2 border-white/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
            <p className="text-xs text-red-200">{user.email} • {user.phone || 'No phone added'}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/20">
              Customer Account
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
        >
          Sign Out
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Saved Delivery Information */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-sm font-black text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-[#C8102E]" />
              Delivery Details
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-xs font-bold text-[#C8102E] hover:underline"
            >
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Default Delivery Address</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-asper-gradient text-white py-2.5 rounded-xl font-bold shadow"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-xs text-gray-600">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not specified'}</p>
              <p><strong>Address:</strong> {user.address || 'No address saved yet'}</p>
            </div>
          )}
        </div>

        {/* Right: My Orders History */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 flex items-center border-b pb-3">
            <Package className="w-4 h-4 mr-1.5 text-[#C8102E]" />
            My Orders ({orders.length})
          </h3>

          {loading ? (
            <p className="text-xs text-gray-500 py-4 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>You have not placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-gray-900 text-xs">Order #{order.order_number}</span>
                      <div className="text-[11px] text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => onTrackOrder(order.order_number)}
                        className="bg-[#C8102E] text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow hover:opacity-95"
                      >
                        Track
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 pt-2 border-t border-gray-200 text-xs">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.product_title} × {item.quantity}</span>
                        <span className="font-semibold">৳{item.total_price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-black text-gray-900 pt-1 border-t">
                      <span>Total (including delivery):</span>
                      <span className="text-[#C8102E]">৳{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
