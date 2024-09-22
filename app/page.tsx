"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Progress, Pagination, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, AvatarGroup, Avatar } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";
import { title, subtitle } from "../components/primitives";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, CurrencyDollarIcon, BriefcaseIcon, ExclamationCircleIcon, UserGroupIcon, ArrowTrendingUpIcon, ClockIcon } from "@heroicons/react/24/outline";
import DateRangePicker from "./components/DateRangePicker";
import { supabase } from "@/lib/supabaseClient";

// Mock data (replace with real data later)
const revenueData = [
  { name: 'Jan', income: 4000000, expenses: 3000000 },
  { name: 'Feb', income: 3500000, expenses: 2800000 },
  { name: 'Mar', income: 5000000, expenses: 3500000 },
  { name: 'Apr', income: 4500000, expenses: 3200000 },
  { name: 'May', income: 6000000, expenses: 4000000 },
  { name: 'Jun', income: 5500000, expenses: 3800000 },
];

const bookingStatusData = [
  { name: 'Completed', value: 400 },
  { name: 'Scheduled', value: 300 },
  { name: 'Cancelled', value: 50 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Updated mock data for service performance
const servicePerformanceData = [
  { name: 'Jan', 'Couch Cleaning': 40, 'Carpet Cleaning': 30, 'Car Seats Cleaning': 20, 'Mattress Cleaning': 25 },
  { name: 'Feb', 'Couch Cleaning': 45, 'Carpet Cleaning': 35, 'Car Seats Cleaning': 25, 'Mattress Cleaning': 30 },
  { name: 'Mar', 'Couch Cleaning': 50, 'Carpet Cleaning': 40, 'Car Seats Cleaning': 30, 'Mattress Cleaning': 35 },
  { name: 'Apr', 'Couch Cleaning': 55, 'Carpet Cleaning': 45, 'Car Seats Cleaning': 35, 'Mattress Cleaning': 40 },
  { name: 'May', 'Couch Cleaning': 60, 'Carpet Cleaning': 50, 'Car Seats Cleaning': 40, 'Mattress Cleaning': 45 },
  { name: 'Jun', 'Couch Cleaning': 65, 'Carpet Cleaning': 55, 'Car Seats Cleaning': 45, 'Mattress Cleaning': 50 },
];

// Mock data for today's bookings
const todayBookings = [
  { id: 1, client: 'Acme Corp', location: 'New York', team: ['John', 'Jane'], price: 150000, time: '09:00 AM' },
  { id: 2, client: 'XYZ Inc', location: 'Los Angeles', team: ['Alice', 'Bob'], price: 200000, time: '11:30 AM' },
  { id: 3, client: 'Tech Solutions', location: 'Chicago', team: ['Charlie', 'Diana'], price: 180000, time: '02:00 PM' },
  { id: 4, client: 'Global Industries', location: 'Houston', team: ['Eve', 'Frank'], price: 220000, time: '04:30 PM' },
];

// Helper function to format FCFA
const formatFCFA = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
};

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    end: new Date()
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [todayForecast, setTodayForecast] = useState({
    bookings: 0,
    revenue: 0,
    teamMembers: 0,
    topService: '',
    completionRate: 0
  });

  const handleTabChange = (key: React.Key) => {
    setSelectedTab(key.toString());
    // Here you would fetch and update data based on the selected tab
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start: new Date(start), end: new Date(end) });
    // Here you would fetch and update data based on the selected date range
  };

  useEffect(() => {
    fetchRecentActivities();
    fetchTodayForecast();
  }, [activitiesPage]);

  const fetchRecentActivities = async () => {
    // This is a mock implementation. Replace with actual API call.
    const mockActivities = [
      { id: 1, type: 'booking', description: 'New booking for office cleaning', time: '2 hours ago', value: '150000 FCFA', customer: 'Acme Corp' },
      { id: 2, type: 'income', description: 'Payment received for Job #1234', time: '4 hours ago', value: '200000 FCFA', customer: 'XYZ Inc' },
      { id: 3, type: 'expense', description: 'Equipment purchase', time: '1 day ago', value: '50000 FCFA', customer: 'N/A' },
      { id: 4, type: 'booking', description: 'Completed job #5678', time: '2 days ago', value: '5 star rating', customer: 'ABC Ltd' },
      { id: 5, type: 'income', description: 'Payment received for Job #5678', time: '2 days ago', value: '180000 FCFA', customer: 'ABC Ltd' },
    ];
    setRecentActivities(mockActivities);
    setTotalActivities(mockActivities.length);
  };

  const fetchTodayForecast = async () => {
    // This is a mock implementation. Replace with actual API call.
    setTodayForecast({
      bookings: 5,
      revenue: 250000,
      teamMembers: 3,
      topService: 'Carpet Cleaning',
      completionRate: 92
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={title({ size: "sm" })}>Dashboard Overview</h2>
          <h3 className={subtitle({ class: "mt-1" })}>Here's a summary of your business</h3>
        </div>
        <DateRangePicker
          onChange={handleDateRangeChange}
          initialStartDate={dateRange.start.toISOString().split('T')[0]}
          initialEndDate={dateRange.end.toISOString().split('T')[0]}
          showTwoCalendars={true}
        />
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
              <p className="text-2xl font-bold">{formatFCFA(28000000)}</p>
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
              <p className="text-2xl font-bold">{formatFCFA(5200000)}</p>
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
                <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  formatter={(value: number) => [formatFCFA(value), 'Amount']}
                />
                <Legend />
                <Bar dataKey="income" fill="#8884d8" name="Income" />
                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex justify-between items-center">
            <span>Recent Activities</span>
            <Pagination
              total={Math.ceil(totalActivities / 5)}
              page={activitiesPage}
              onChange={setActivitiesPage}
              size="sm"
            />
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center gap-2 text-sm">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'booking' ? 'bg-primary/10' : 
                    activity.type === 'expense' ? 'bg-warning/10' : 
                    activity.type === 'income' ? 'bg-success/10' : 'bg-secondary/10'
                  }`}>
                    {activity.type === 'booking' ? (
                      <BriefcaseIcon className="h-4 w-4 text-primary" />
                    ) : activity.type === 'expense' ? (
                      <ExclamationCircleIcon className="h-4 w-4 text-warning" />
                    ) : activity.type === 'income' ? (
                      <CurrencyDollarIcon className="h-4 w-4 text-success" />
                    ) : (
                      <UserGroupIcon className="h-4 w-4 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-xs text-default-400">{activity.time} - {activity.customer}</p>
                  </div>
                  <span className="text-xs font-medium text-success">{activity.value}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>Service Performance</CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Couch Cleaning" fill="#8884d8" />
              <Bar dataKey="Carpet Cleaning" fill="#82ca9d" />
              <Bar dataKey="Car Seats Cleaning" fill="#ffc658" />
              <Bar dataKey="Mattress Cleaning" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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

        <Card className="col-span-1">
          <CardHeader>Today's Bookings</CardHeader>
          <CardBody>
            <Table aria-label="Today's bookings">
              <TableHeader>
                <TableColumn>CLIENT</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>TEAM</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>TIME</TableColumn>
              </TableHeader>
              <TableBody>
                {todayBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.client}</TableCell>
                    <TableCell>{booking.location}</TableCell>
                    <TableCell>
                      <AvatarGroup isBordered max={3}>
                        {booking.team.map((member, index) => (
                          <Avatar 
                            key={index}
                            name={member}
                            src={`https://i.pravatar.cc/150?u=${member}`}
                            size="sm"
                          />
                        ))}
                      </AvatarGroup>
                    </TableCell>
                    <TableCell>{formatFCFA(booking.price)}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}