import React, { useState, useEffect } from 'react';
import { DatePicker, Button, message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const { RangePicker } = DatePicker;

interface Category {
  quantity: number;
  amount: number;
}

interface OrderDetail {
  orderId: string;
  amount: number;
  items: number;
  date: string;
  _id: string;
}

interface DailySales {
  [key: string]: number;
}

interface MonthlySales {
  [month: string]: number;
}

interface CategorySales {
  name: string;
  value: number;
}

interface SalesReport {
  _id: string;
  type: 'monthly' | 'yearly' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  totalSales: number;
  dailySales: DailySales;
  totalOrders: number;
  salesByCategory: {
    [key: string]: Category;
  };
  details: OrderDetail[];
  createdAt: string;
  monthlySalesData: MonthlySales[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SalesReport: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [report, setReport] = useState<SalesReport>({
    _id: '',
    type: 'monthly',
    dateRange: {
      start: '',
      end: ''
    },
    totalSales: 0,
    monthlySalesData: [],
    dailySales: {},
    totalOrders: 0,
    salesByCategory: {},
    details: [],
    createdAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeReport, setActiveReport] = useState<'monthly' | 'yearly'>('monthly');

  // 獲取類別名稱
  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      const categoryMap = data.reduce((acc: { [key: string]: string }, cat: { _id: string; name: string }) => {
        acc[cat._id] = cat.name;
        return acc;
      }, {});
      setCategories(categoryMap);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCurrentMonthReport();
  }, []);

  // 獲取當月報告（默認顯示）
  const fetchCurrentMonthReport = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/reports/current-month`);
      if (!response.ok) throw new Error('Failed to fetch current month report');
      const data = await response.json();
      setReport(data);
      console.log(data);
    } catch (error) {
      message.error('Failed to load current month report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 獲取年度報告
  const fetchYearlyReport = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/reports/yearly?year=${currentYear}`
      );
      if (!response.ok) throw new Error('Failed to fetch yearly report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      message.error('Failed to load yearly report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 獲取自定義日期範圍報告
  const fetchCustomReport = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_BACKEND_URL}/reports/custom?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch custom report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      message.error('Failed to load custom report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 處理日期範圍選擇
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].format('YYYY-MM-DD');
      const endDate = dates[1].format('YYYY-MM-DD');
      fetchCustomReport(startDate, endDate);
    }
  };

  // 處理類別銷售數據為圓餅圖格式
  const prepareCategoryData = (): CategorySales[] => {
    return Object.entries(report.salesByCategory).map(([categoryId, data]) => ({
      name: categories[categoryId] || 'Unknown',
      value: data.amount
    }));
  };

  // 修改圖表尺寸計算邏輯
  const getChartDimensions = () => {
    const width = window.innerWidth;
    if (width < 768) { // 移動設備
      return {
        width: width - 48, // 考慮容器padding
        height: width < 400 ? 280 : 300 // 較小螢幕使用更小的高度
      };
    }
    return {
      width: 500,
      height: 300
    };
  };

  // 修改按鈕點擊處理函數
  const handleMonthlyReport = async () => {
    setActiveReport('monthly');
    await fetchCurrentMonthReport();
  };

  const handleYearlyReport = async () => {
    setActiveReport('yearly');
    await fetchYearlyReport();
  };

  const renderData = () => {
    const { width } = getChartDimensions();
    const dailySalesData = Object.entries(report.dailySales).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString(),
      amount: amount
    }));

    if (report.type === 'monthly') {
      return (
        <>
          {/* 總計數據卡片 - 優化移動端顯示 */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 mb-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase">Monthly Sales</h3>
                <p className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">
                  ${(report.monthlySalesData?.[0]?.amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase">Monthly Orders</h3>
                <p className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">
                  {report.totalOrders || 0}
                </p>
              </div>
            </div>

            {/* 圖表容器 - 優化移動端顯示 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
              {/* 每日銷售額圖表 */}
              <div className="bg-white p-3 md:p-4 rounded-lg shadow">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Daily Sales</h3>
                <div className="flex justify-center items-center">
                  <BarChart 
                    width={getChartDimensions().width} 
                    height={getChartDimensions().height} 
                    data={dailySalesData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: width < 768 ? 10 : 12 }}
                      interval={width < 768 ? 2 : 0} // 移動端顯示較少的刻度
                    />
                    <YAxis
                      tick={{ fontSize: width < 768 ? 10 : 12 }}
                    />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: width < 768 ? '12px' : '14px',
                        padding: '10px 0'
                      }}
                    />
                    <Bar dataKey="amount" fill="#8884d8" name="Sales Amount" />
                  </BarChart>
                </div>
              </div>

              {/* 類別銷售額圓餅圖 */}
              <div className="bg-white p-3 md:p-4 rounded-lg shadow">
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Sales by Category</h3>
                <div className="flex justify-center items-center">
                  <PieChart width={getChartDimensions().width} height={getChartDimensions().height}>
                    <Pie
                      data={prepareCategoryData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={width < 768 ? width * 0.15 : 60}
                      outerRadius={width < 768 ? width * 0.25 : 100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, value}) => `${name}: $${value.toFixed(2)}`}
                    >
                      {prepareCategoryData().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend 
                      layout="vertical"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{ 
                        fontSize: width < 768 ? '12px' : '14px',
                        padding: '10px 0'
                      }} 
                    />
                  </PieChart>
                </div>
              </div>
            </div>
          </div>
          
          <div className='p-4'>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
              <div className="bg-white rounded-lg shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(report.salesByCategory).map(([categoryId, data]) => (
                        <tr key={categoryId}>
                          <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900">
                            {categories[categoryId] || 'Unknown Category'}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            {data.quantity}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${data.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}

                      {/* 無數據時的提示 */}
                      {Object.keys(report.salesByCategory).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 md:px-6 py-2 md:py-3 text-center text-sm text-gray-500">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 訂單詳情表格 - 優化移動端顯示 */}
          <div className="mt-6 p-4 md:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* 前三筆訂單 */}
                    {report.details.slice(0, 3).map((detail) => (
                      <tr key={detail._id}>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(detail.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {detail.items}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${detail.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* 展開/關閉的剩餘訂單 */}
                    {isExpanded && report.details.slice(3).map((detail) => (
                      <tr key={detail._id}>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(detail.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          {detail.items}
                        </td>
                        <td className="px-3 md:px-6 py-2 md:py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                          ${detail.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* 展開/關閉按鈕 */}
                    {report.details.length > 3 && (
                      <tr>
                        <td colSpan={3} className="px-3 md:px-6 py-2 md:py-3">
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full text-sm text-blue-600 hover:text-blue-800 text-center focus:outline-none"
                          >
                            {isExpanded ? 'Collapse' : `Show more (${report.details.length - 3} orders)`}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      );
    } else if (report.type === 'yearly') {
      return (
        <div className="space-y-6">
          {/* 總計數據卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Sales</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                ${(report.totalSales || 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Orders</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {report.totalOrders || 0}
              </p>
            </div>
          </div>

          {/* 圖表區域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 每月銷售額直方圖 */}
            <div className="bg-white p-3 md:p-4 rounded-lg shadow">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Monthly Sales Trend</h3>
              <div className="flex justify-center items-center">
                <BarChart 
                  width={getChartDimensions().width} 
                  height={getChartDimensions().height} 
                  data={report.monthlySalesData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: width < 768 ? 10 : 12 }}
                    interval={width < 768 ? 1 : 0} // 移動端顯示較少的刻度
                  />
                  <YAxis
                    tick={{ fontSize: width < 768 ? 10 : 12 }}
                  />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: width < 768 ? '12px' : '14px',
                      padding: '10px 0'
                    }}
                  />
                  <Bar dataKey="amount" fill="#8884d8" name="Sales Amount" />
                </BarChart>
              </div>
            </div>
            
            {/* 類別銷售額圓餅圖 */}
            <div className="bg-white p-3 md:p-4 rounded-lg shadow">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-3">Sales by Category</h3>
              <div className="flex justify-center items-center">
                <PieChart 
                  width={getChartDimensions().width} 
                  height={getChartDimensions().height}
                >
                  <Pie
                    data={prepareCategoryData()}
                    cx="50%"
                    cy="45%" // 調整圓心位置，留更多空間給圖例
                    innerRadius={width < 768 ? width * 0.12 : 50}
                    outerRadius={width < 768 ? width * 0.2 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, value}) => `${name}: $${value.toFixed(0)}`} // 簡化標籤內容
                  >
                    {prepareCategoryData().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value}`}
                    contentStyle={{ fontSize: width < 768 ? '12px' : '14px' }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ 
                      fontSize: width < 768 ? '10px' : '12px',
                      padding: '10px 0',
                      width: '100%'
                    }}
                  />
                </PieChart>
              </div>
            </div>
          </div>

         
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* 頂部控制區 - 優化移動端顯示 */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900">Sales Report</h1>
                <p className="mt-1 text-xs md:text-sm text-gray-500">
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report: {' '}
                  {new Date(report.dateRange.start).toLocaleDateString()} - {' '}
                  {new Date(report.dateRange.end).toLocaleDateString()}
                </p>
              </div>
              
              {/* 控制按鈕組 - 移動端堆疊顯示 */}
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <Button
                  onClick={handleMonthlyReport}
                  className={`w-full md:w-auto ${
                    activeReport === 'monthly'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Current Month
                </Button>
                <Button
                  onClick={handleYearlyReport}
                  className={`w-full md:w-auto ${
                    activeReport === 'yearly'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Yearly Report
                </Button>
                <RangePicker 
                  onChange={handleDateRangeChange}
                  className="w-full md:w-64"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : (
            <div className="p-6">       
              {!loading && renderData()}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
