"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Divider, Chip, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Radio, RadioGroup, Badge } from "@nextui-org/react";
import { title } from "../../components/primitives";
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, PhoneIcon, UserGroupIcon, InformationCircleIcon, TrashIcon, ShareIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// This would typically come from an API or database
const getBookingDetails = (id: string) => {
  // Placeholder data
  return {
    id: parseInt(id),
    services: ["Couch Cleaning", "Carpet Cleaning"],
    location: "123 Main St, New York, NY 10001",
    date: "2023-06-01T10:00",
    price: 150,
    status: "scheduled",
    assignedTo: [
      { name: "John Doe", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
      { name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" }
    ],
    phone: "123-456-7890",
    priority: false,
    moreInfo: "Customer requested extra care for antique furniture",
  };
};

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const booking = getBookingDetails(bookingId);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [completionDate, setCompletionDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = React.useState(booking.price.toString());
  const [paymentMethod, setPaymentMethod] = React.useState("cash");

  const handleDelete = () => {
    // Implement delete logic here
    console.log("Deleting booking:", bookingId);
    // After deletion, navigate back to bookings list
    router.push('/bookings');
  };

  const handleMarkAsCompleted = () => {
    setIsCompleteModalOpen(true);
  };

  const handleConfirmCompletion = () => {
    // Implement completion logic here
    console.log("Marking booking as completed:", bookingId);
    console.log("Completion date:", completionDate);
    console.log("Amount paid:", amountPaid);
    console.log("Payment method:", paymentMethod);
    setIsCompleteModalOpen(false);
    // After completion, you might want to refresh the booking data or navigate
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge
            content="Priority"
            color="danger"
            placement="top-right"
            // Remove isInvisible prop to always show the badge
          >
            <h1 className={title({ size: "md" })}>
              Booking Details
            </h1>
          </Badge>
          <Chip color={booking.status === 'scheduled' ? 'primary' : booking.status === 'completed' ? 'success' : 'danger'} size="lg">
            {booking.status.toUpperCase()}
          </Chip>
        </div>
        <div className="flex space-x-2">
          <Button color="primary" variant="bordered" startContent={<ShareIcon className="w-4 h-4" />}>
            Share
          </Button>
          <Button color="primary" variant="bordered" startContent={<PencilIcon className="w-4 h-4" />}>
            Edit
          </Button>
          <Button color="danger" variant="bordered" startContent={<TrashIcon className="w-4 h-4" />} onPress={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {booking.services.map((service, index) => (
                <Chip key={index} color="primary" variant="flat">
                  {service}
                </Chip>
              ))}
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Planned for:</span>
                <span>{new Date(booking.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Location:</span>
                <span>{booking.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Price:</span>
                <span>${booking.price}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Client phone:</span>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered" size="md">
                      {booking.phone}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Phone Actions">
                    <DropdownItem key="call" onPress={() => window.location.href = `tel:${booking.phone}`}>
                      Call
                    </DropdownItem>
                    <DropdownItem key="whatsapp" onPress={() => window.open(`https://wa.me/237${booking.phone.replace(/\D/g,'')}`, '_blank')}>
                      WhatsApp
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className={title({ size: 'sm' })}>Additional Information</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Notes:</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{booking.moreInfo}</p>
              </div>
              <div>
                <span className="font-semibold">Assigned Team:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.assignedTo.map((member, index) => (
                    <Link href={`/team/${member.name.toLowerCase().replace(' ', '-')}`} key={index}>
                      <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Avatar src={member.avatar} size="sm" />
                        <span className="text-sm">{member.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created on: {new Date().toLocaleDateString()} by John Doe
        </span>
        <Button color="primary" size="lg" onPress={handleMarkAsCompleted}>
          Mark as Completed
        </Button>
      </div>

      <Modal 
        isOpen={isCompleteModalOpen} 
        onClose={() => setIsCompleteModalOpen(false)}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Mark Booking as Completed</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                type="date"
                label="Job completed on:"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
              <Input
                type="number"
                label="Amount paid:"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
              />
              <RadioGroup
                label="Paid via:"
                orientation="horizontal"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <Radio value="cash">Cash</Radio>
                <Radio value="mobile_money">Mobile Money</Radio>
              </RadioGroup>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsCompleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleConfirmCompletion}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}