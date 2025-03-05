import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, CreditCard } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6 dashboard-main">
      <div className="flex items-center justify-between">
        <h1 id="dashboard-txt">Dashboard</h1>        
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$24,780</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 text-sm">+8.2%</span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">$8,530</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-500 text-sm">+2.3%</span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">142</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 text-sm">+12.1%</span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 text-sm">+3.7%</span>
            <span className="text-gray-500 text-sm ml-2">from last month</span>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      
    </div>
  );
};

export default Dashboard;