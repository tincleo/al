"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Divider, Chip, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Radio, RadioGroup, Badge } from "@nextui-org/react";
import { title } from "../../components/primitives";
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, PhoneIcon, UserGroupIcon, InformationCircleIcon, TrashIcon, ShareIcon, PencilIcon, CameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import Image from 'next/image';

type Booking = {
  id: number;
  created_at: string;
  services: string[];
  location: string;
  address: string;
  planned_at: string;
  price: number;
  status: string;
  assigned_to: { name: string; id: string }[];
  client_phone: string;
  priority: boolean;
  more_info: string | null;
  completed_at: string | null;
  amount_paid: number | null;
  payment_method: string | null;
  created_by: string | null;
  state: string | null;
  images_after: string[] | null;
};

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [imagesAfter, setImagesAfter] = useState<string[]>([]);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking details:', error);
    } else {
      setBooking(data);
      if (data.amount_paid) setAmountPaid(data.amount_paid.toString());
      
      // Fetch image URLs for images_after only
      if (data.images_after) {
        const afterUrls = await Promise.all(data.images_after.map(getImageUrl));
        setImagesAfter(afterUrls.filter(Boolean) as string[]);
      }
    }
  };

  const getImageUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('alpha')
      .getPublicUrl(path);

    if (!data) {
      console.error('Error getting public URL for image');
      return null;
    }
    return data.publicUrl;
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Error deleting booking:', error);
    } else {
      router.push('/bookings');
    }
  };

  const handleMarkAsCompleted = () => {
    setIsCompleteModalOpen(true);
  };

  const handleConfirmCompletion = async () => {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: completionDate,
        amount_paid: parseFloat(amountPaid),
        payment_method: paymentMethod
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating booking:', error);
    } else {
      setIsCompleteModalOpen(false);
      fetchBookingDetails();
    }
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge
            content="Priority"
            color="danger"
            placement="top-right"
            isInvisible={!booking.priority}
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
                <span>{new Date(booking.planned_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Location:</span>
                <span>{booking.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Address:</span>
                <span>{booking.address}</span>
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
                      {booking.client_phone}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Phone Actions">
                    <DropdownItem key="call" onPress={() => window.location.href = `tel:${booking.client_phone}`}>
                      Call
                    </DropdownItem>
                    <DropdownItem key="whatsapp" onPress={() => window.open(`https://wa.me/${booking.client_phone.replace(/\D/g,'')}`, '_blank')}>
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
                <p className="text-gray-600 dark:text-gray-300">{booking.more_info || 'No additional information'}</p>
              </div>
              <div>
                <span className="font-semibold">Assigned Team:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.assigned_to.map((member, index) => (
                    <Link href={`/team/${member.id}`} key={index}>
                      <div className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Avatar name={member.name} size="sm" />
                        <span className="text-sm">{member.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold">State:</span>
                <span>{booking.state || 'Not specified'}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className={title({ size: 'sm' })}>Images</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              {imagesAfter.length > 0 && (
                <div>
                  <span className="font-semibold">Images After:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imagesAfter.map((image, index) => (
                      <Image 
                        key={index} 
                        src={image} 
                        alt={`After ${index + 1}`} 
                        width={96} 
                        height={96} 
                        className="object-cover rounded" 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created on: {new Date(booking.created_at).toLocaleDateString()} by {booking.created_by || 'Unknown'}
        </span>
        {booking.status !== 'completed' && (
          <Button color="primary" size="lg" onPress={handleMarkAsCompleted}>
            Mark as Completed
          </Button>
        )}
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