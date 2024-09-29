"use client";

import React from "react";
import {
  Navbar,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  User,
  Breadcrumbs,
  BreadcrumbItem,
} from "@nextui-org/react";
import { usePathname } from "next/navigation";

type TopMenuProps = {
  userName?: string;
};

export function TopMenu({ userName }: TopMenuProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <Navbar isBordered className="border-b border-divider px-4" maxWidth="full">
      <NavbarContent className="flex-1" justify="start">
        <Breadcrumbs>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          {pathSegments.map((segment, index) => {
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;
            const label =
              isLast && userName
                ? userName
                : segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <BreadcrumbItem key={index} href={href}>
                {label}
              </BreadcrumbItem>
            );
          })}
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
            <DropdownItem key="settings">My Settings</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
}
