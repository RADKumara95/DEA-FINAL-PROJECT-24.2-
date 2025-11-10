import React from 'react';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-800">Checkout Confirmation</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                  <p className="text-gray-600 text-sm mb-1">Quantity: {item.quantity}</p>
                  <p className="text-blue-600 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
            
            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg">
                  <p className="text-xl font-bold">Total: ${totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
          <button
            onClick={handleCheckout}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPopup;
