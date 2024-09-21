"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Progress } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";
import { title, subtitle } from "../components/primitives";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CalendarIcon, CurrencyDollarIcon, BriefcaseIcon, ExclamationCircleIcon, UserGroupIcon, ArrowTrendingUpIcon, ClockIcon } from "@heroicons/react/24/outline";
import DateRangePicker from "./components/DateRangePicker";

// Mock data (replace with real data later)
const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

const bookingStatusData = [
  { name: 'Completed', value: 400 },
  { name: 'Scheduled', value: 300 },
  { name: 'Cancelled', value: 50 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentActivities = [
  { id: 1, type: 'booking', description: 'New booking for office cleaning', time: '2 hours ago' },
  { id: 2, type: 'team', description: 'John Doe completed a job', time: '4 hours ago' },
  { id: 3, type: 'booking', description: 'Booking #1234 was rescheduled', time: '1 day ago' },
  { id: 4, type: 'team', description: 'New team member Jane Smith added', time: '2 days ago' },
];

const teamPerformanceData = [
  { name: 'John', bookings: 45, revenue: 5000 },
  { name: 'Jane', bookings: 38, revenue: 4200 },
  { name: 'Bob', bookings: 52, revenue: 5800 },
  { name: 'Alice', bookings: 30, revenue: 3500 },
];

const customerSatisfactionData = [
  { name: 'Jan', satisfaction: 85 },
  { name: 'Feb', satisfaction: 88 },
  { name: 'Mar', satisfaction: 90 },
  { name: 'Apr', satisfaction: 87 },
  { name: 'May', satisfaction: 92 },
  { name: 'Jun', satisfaction: 91 },
];

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const handleTabChange = (key: React.Key) => {
    setSelectedTab(key.toString());
    // Here you would fetch and update data based on the selected tab
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
    // Here you would fetch and update data based on the selected date range
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={title({ size: "sm" })}>Dashboard Overview</h2>
          <h3 className={subtitle({ class: "mt-1" })}>Here's a summary of your business</h3>
        </div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>

      <Tabs 
        aria-label="Time frame options" 
        selectedKey={selectedTab} 
        onSelectionChange={handleTabChange}
      >
        <Tab key="today" title="Today" />
        <Tab key="this-week" title="This Week" />
        <Tab key="this-month" title="This Month" />
        <Tab key="this-year" title="This Year" />
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-small text-default-500">Total Revenue</p>
              <p className="text-2xl font-bold">$28,000</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-2 bg-success/10 rounded-full">
              <BriefcaseIcon className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-small text-default-500">Total Bookings</p>
              <p className="text-2xl font-bold">750</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-2 bg-warning/10 rounded-full">
              <ExclamationCircleIcon className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-small text-default-500">Pending Payments</p>
              <p className="text-2xl font-bold">$5,200</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-2 bg-secondary/10 rounded-full">
              <CalendarIcon className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-small text-default-500">Upcoming Bookings</p>
              <p className="text-2xl font-bold">28</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="col-span-1">
          <CardHeader>Revenue Over Time</CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-1">
          <CardHeader>Booking Status Distribution</CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="col-span-1">
          <CardHeader>Team Performance</CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-1">
          <CardHeader>Customer Satisfaction Trend</CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerSatisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="satisfaction" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="col-span-1">
          <CardHeader>Top Services</CardHeader>
          <CardBody>
            <ul className="space-y-2">
              <li className="flex justify-between items-center">
                <span>Office Cleaning</span>
                <Progress value={75} className="max-w-md" />
              </li>
              <li className="flex justify-between items-center">
                <span>Carpet Cleaning</span>
                <Progress value={60} className="max-w-md" color="secondary" />
              </li>
              <li className="flex justify-between items-center">
                <span>Window Cleaning</span>
                <Progress value={45} className="max-w-md" color="success" />
              </li>
            </ul>
          </CardBody>
        </Card>

        <Card className="col-span-1">
  <CardHeader>Business Insights</CardHeader>
  <CardBody>
    <ul className="space-y-2">
      <li className="flex items-center gap-2">
        <ArrowTrendingUpIcon className="h-5 w-5 text-success" />
        <span>20% increase in repeat customers</span>
      </li>
      <li className="flex items-center gap-2">
        <UserGroupIcon className="h-5 w-5 text-primary" />
        <span>5 new team members onboarded</span>
      </li>
      <li className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-warning" />
        <span>Average service time reduced by 15%</span>
      </li>
    </ul>
  </CardBody>
</Card>

        <Card className="col-span-1">
          <CardHeader>Recent Activities</CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'booking' ? 'bg-primary/10' : 'bg-success/10'
                  }`}>
                    {activity.type === 'booking' ? (
                      <BriefcaseIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <CurrencyDollarIcon className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-default-500">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}