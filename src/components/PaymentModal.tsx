import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  totalAmount: number;
  tableId: string;
  orderId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmount,
  tableId,
  orderId
}) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const { fetchWithAuth } = useAuth();

  const handleNumberClick = (num: string) => {
    if (num === '.' && amountPaid.includes('.')) return;
    if (num === '.' && amountPaid === '') {
      setAmountPaid('0.');
      return;
    }
    setAmountPaid(prev => prev + num);
  };

  const handleClear = () => {
    setAmountPaid('');
    setError('');
  };

  const handleDelete = () => {
    setAmountPaid(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async () => {
    const paid = parseFloat(amountPaid);
    // 将金额转换为整数进行比较（乘以100消除小数）
    const paidInCents = Math.round(paid * 100);
    const totalInCents = Math.round(totalAmount * 100);

    if (paidInCents < totalInCents) {
      setError('Amount paid must be greater than or equal to total amount');
      return;
    }

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          tableId,
          totalAmount,
          amountPaid: paid,
          change: Math.round((paid - totalAmount) * 100) / 100,
          paymentMethod,
          createdAt: new Date(),
          status: 'success'
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      await onPaymentSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };
  

  if (!isOpen) return null;

  const change = amountPaid ? parseFloat(amountPaid) - totalAmount : 0;

  const getChangeTextColor = () => {
    if (!amountPaid) return 'text-gray-500';
    return Math.round(change * 100) / 100 < 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Payment</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm md:text-base">Total Amount</p>
            <p className="text-xl md:text-2xl font-bold">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600 text-sm md:text-base">Amount Paid</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {amountPaid ? `$${amountPaid}` : '-'}
            </p>
          </div>
          <input
            type="text"
            value={amountPaid}
            readOnly
            className="w-full text-xl md:text-2xl font-bold bg-gray-100 p-3 rounded"
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm md:text-base">Change</p>
            <p className={`text-xl md:text-2xl font-bold ${getChangeTextColor()}`}>
              {amountPaid ? `$${change.toFixed(2)}` : '-'}
            </p>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm md:text-base mb-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="bg-gray-200 p-4 md:p-5 rounded-lg hover:bg-gray-300 
                       text-lg md:text-xl font-medium transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="bg-red-200 p-4 md:p-5 rounded-lg hover:bg-red-300 
                     text-lg md:text-xl font-medium transition-colors"
          >
            ←
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4">
          <button
            onClick={handleClear}
            className="bg-gray-500 text-white p-3 md:p-4 rounded-lg hover:bg-gray-600 
                     text-sm md:text-base font-medium transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white p-3 md:p-4 rounded-lg hover:bg-green-600 
                     text-sm md:text-base font-medium transition-colors"
          >
            Submit
          </button>
        </div>

        <div className="mt-6">
          <p className="text-gray-600 text-sm md:text-base mb-2">Payment Method</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`px-4 py-2 rounded-lg text-sm md:text-base font-medium 
                        transition-colors ${
                paymentMethod === 'cash' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 