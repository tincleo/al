"use client";

import React, { useState } from "react";
import { Link } from "@nextui-org/link";
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";

import { NewBookingForm } from "./NewBookingForm";

export function Sidebar() {
  const pathname = usePathname();
  const [selectedItem, setSelectedItem] = useState(pathname);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Bookings", href: "/bookings", icon: CalendarIcon },
    { name: "Finances", href: "/finances", icon: ChartBarIcon },
    { name: "Team", href: "/team", icon: UserGroupIcon },
  ];

  const settingsItem = { name: "Settings", href: "/settings", icon: CogIcon };

  const closeModal = () => setIsModalOpen(false);

  return (
    <aside className="w-64 bg-background text-foreground border-r border-divider flex flex-col h-screen fixed top-0 left-0">
      <div className="p-4">
        <h1 className="text-xl font-bold">Alpha Cleaning</h1>
      </div>
      <div className="px-4 mb-4">
        <Button
          className="w-full"
          color="default" // Changed from "primary" to "default"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={() => setIsModalOpen(true)}
        >
          New Booking
        </Button>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${
                  selectedItem === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground-500 hover:bg-primary/20 hover:text-foreground"
                }`}
                href={item.href}
                onClick={() => setSelectedItem(item.href)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-divider">
        <Link
          className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${
            selectedItem === settingsItem.href
              ? "bg-primary text-primary-foreground"
              : "text-foreground-500 hover:bg-primary/20 hover:text-foreground"
          }`}
          href={settingsItem.href}
          onClick={() => setSelectedItem(settingsItem.href)}
        >
          <settingsItem.icon className="w-5 h-5" />
          <span>{settingsItem.name}</span>
        </Link>
      </div>

      <Modal
        isDismissable={false}
        isOpen={isModalOpen}
        size="3xl"
        onClose={closeModal}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">New Booking</ModalHeader>
          <ModalBody>
            <NewBookingForm onClose={closeModal} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </aside>
  );
}
