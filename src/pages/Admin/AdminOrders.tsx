import React, { useState, useEffect, useCallback } from 'react';
import TopBar from '../../components/TopBar';
import PaymentModal from './PaymentModal';
import { message } from 'antd';
// import { useAuth } from '../../hooks/useAuth';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TableOrder {
  tableId: string;
  orders: Order[];
  totalAmount: number;
}

const AdminOrders: React.FC = () => {
  // const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setRefreshing(true);
      }
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders?unpaid=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      // 如果當前選中的桌號的所有訂單都已結帳，清除選中狀態
      if (selectedTableId && !data.some((order: Order) => order.tableId === selectedTableId)) {
        setSelectedTableId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); 

  // 初始加載訂單
  useEffect(() => {
    fetchOrders(true);  // 初始加載顯示 loading
  }, [fetchOrders]);

  // 處理支付成功
  const handlePaymentSuccess = async () => {
    await fetchOrders(false);  // 刷新數據時不顯示 loading
    setIsPaymentModalOpen(false);
    message.success('Payment processed successfully');
  };

  // 處理訂單數據，按桌號分組
  const groupedOrders = React.useMemo(() => {
    const grouped = orders.reduce((acc: { [key: string]: TableOrder }, order) => {
      if (order.status !== 'paid') {
        if (!acc[order.tableId]) {
          acc[order.tableId] = {
            tableId: order.tableId,
            orders: [],
            totalAmount: 0
          };
        }
        acc[order.tableId].orders.push(order);
        acc[order.tableId].totalAmount += order.totalAmount;
      }
      return acc;
    }, {});
    return Object.values(grouped);
  }, [orders]);

  // 獲取選中桌子的訂單
  const selectedTableOrders = selectedTableId 
    ? groupedOrders.find(group => group.tableId === selectedTableId)
    : null;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      {/* 可以添加一個輕量級的刷新指示器 */}
      {refreshing && (
        <div className="fixed top-0 left-0 w-full h-1">
          <div className="h-full bg-blue-500 animate-pulse"></div>
        </div>
      )}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex space-x-4 h-[calc(100vh-120px)]">
          {/* 左側：桌子列表 */}
          <div className="w-1/3 bg-white shadow overflow-hidden sm:rounded-lg flex flex-col">
            <div className="px-4 py-5 sm:px-6 flex-shrink-0">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Tables
              </h3>
            </div>
            <div className="border-t border-gray-200 flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {groupedOrders.map((tableOrder) => (
                  <li
                    key={tableOrder.tableId}
                    className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                      selectedTableId === tableOrder.tableId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedTableId(tableOrder.tableId)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600">
                        Table {tableOrder.tableId}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <p className="text-sm text-gray-500">
                          ${tableOrder.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 右側：訂單詳情 */}
          <div className="w-2/3 bg-white shadow overflow-hidden sm:rounded-lg flex flex-col relative">
            {selectedTableOrders ? (
              <>
                <div className="px-4 py-5 sm:px-6 flex-shrink-0">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Orders for Table {selectedTableOrders.tableId}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-20">
                  <div className="space-y-4">
                    {selectedTableOrders.orders.map((order) => (
                      <div key={order.id} className="border-b pb-4">
                        <p className="text-sm text-gray-500">
                          Order ID: {order.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(order.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-2 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 bg-gray-50 px-4 rounded-lg">
                              <div className="flex items-center space-x-4">
                                {item.menuItem.imageUrl && (
                                  <img 
                                    src={item.menuItem.imageUrl} 
                                    alt={item.menuItem.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{item.menuItem.name}</p>
                                  <p className="text-sm text-gray-500">{item.menuItem.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {item.quantity} x ${item.menuItem.price.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-medium text-lg">
                            ${order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-4 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-indigo-600">
                      ${selectedTableOrders.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Process Payment
                  </button>
                  
                  {/* 結賬彈窗 */}
                  {isPaymentModalOpen && (
                    <PaymentModal
                      isOpen={isPaymentModalOpen}
                      onClose={() => setIsPaymentModalOpen(false)}
                      onPaymentSuccess={handlePaymentSuccess}
                      totalAmount={selectedTableOrders.totalAmount}
                      tableId={selectedTableOrders.tableId}
                      orderId={selectedTableOrders.orders[0].id}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="px-4 py-5 sm:px-6">
                <p className="text-gray-500">Select a table to view orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;