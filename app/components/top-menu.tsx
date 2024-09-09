"use client";

import React from "react";
import { Navbar, NavbarContent, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User, Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { usePathname } from 'next/navigation';

export function TopMenu() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  return (
    <Navbar className="border-b border-divider px-4" maxWidth="full" isBordered>
      <NavbarContent className="flex-1" justify="start">
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          {pathSegments.map((segment, index) => (
            <BreadcrumbItem key={index} href={`/${pathSegments.slice(0, index + 1).join('/')}`}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </NavbarContent>
      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: "https://i.imgur.com/a5oyP85.jpeg",
              }}
              className="transition-transform"
              description="@donfak"
              name="Joel Donfak"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="settings">
              My Settings
            </DropdownItem>
            <DropdownItem key="help_and_feedback">
              Help & Feedback
            </DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}