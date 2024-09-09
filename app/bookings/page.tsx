"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { PlusIcon } from "../components/PlusIcon";
import { VerticalDotsIcon } from "../components/VerticalDotsIcon";
import { ChevronDownIcon } from "../components/ChevronDownIcon";
import { SearchIcon } from "../components/SearchIcon";
import { capitalize } from "../utils";
import { title } from "../components/primitives";
import { NewBookingForm } from "../components/NewBookingForm";
import Link from "next/link";

const statusColorMap: Record<string, ChipProps["color"]> = {
  scheduled: "primary",
  confirmed: "success",
  completed: "secondary",
  canceled: "danger",
};

const columns = [
  { name: "CREATED", uid: "created", sortable: true },
  { name: "ID", uid: "id", sortable: true },
  { name: "SERVICES", uid: "services", sortable: true },
  { name: "LOCATION", uid: "location", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "PLANNED", uid: "planned", sortable: true },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ASSIGNED TO", uid: "assignedTo", sortable: true },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Scheduled", uid: "scheduled" },
  { name: "Confirmed", uid: "confirmed" },
  { name: "Completed", uid: "completed" },
  { name: "Canceled", uid: "canceled" },
];

const INITIAL_VISIBLE_COLUMNS = ["created", "services", "location", "address", "planned", "price", "status", "assignedTo", "phone", "actions"];

type Booking = {
  id: number;
  created: string;
  services: string[];
  location: string;
  address: string;
  planned: string;
  price: number;
  status: string;
  assignedTo: { name: string; id: string }[];
  phone: string;
  priority: boolean;
  moreInfo: string;
};

const bookings: Booking[] = [
  {
    id: 1,
    created: "2023-05-30T09:00",
    services: ["Couches", "Carpets"],
    location: "New York",
    address: "123 Main St, New York, NY 10001",
    planned: "2023-06-01T10:00",
    price: 150,
    status: "scheduled",
    assignedTo: [{ name: "Arnauld", id: "arnauld" }, { name: "Prosper", id: "prosper" }],
    phone: "123-456-7890",
    priority: false,
    moreInfo: "Customer requested extra care for antique furniture",
  },
  {
    id: 2,
    created: "2023-05-31T11:30",
    services: ["Office Cleaning"],
    location: "Los Angeles",
    address: "456 Business Ave, Los Angeles, CA 90001",
    planned: "2023-06-02T09:00",
    price: 300,
    status: "confirmed",
    assignedTo: [{ name: "Michel", id: "michel" }, { name: "Sarah", id: "sarah" }],
    phone: "987-654-3210",
    priority: true,
    moreInfo: "Large office space, requires team of 4",
  },
  {
    id: 3,
    created: "2023-06-01T08:45",
    services: ["Window Cleaning", "Pressure Washing"],
    location: "Chicago",
    address: "789 Lake St, Chicago, IL 60601",
    planned: "2023-06-03T13:00",
    price: 250,
    status: "scheduled",
    assignedTo: [{ name: "John", id: "john" }],
    phone: "555-123-4567",
    priority: false,
    moreInfo: "Three-story building, safety equipment required",
  },
  {
    id: 4,
    created: "2023-06-02T14:20",
    services: ["Deep Cleaning"],
    location: "Houston",
    address: "321 Oak Rd, Houston, TX 77001",
    planned: "2023-06-04T10:00",
    price: 200,
    status: "confirmed",
    assignedTo: [{ name: "Emma", id: "emma" }, { name: "Luis", id: "luis" }],
    phone: "832-555-1234",
    priority: false,
    moreInfo: "Post-construction cleaning, dust protection needed",
  },
  {
    id: 5,
    created: "2023-06-03T09:10",
    services: ["Carpet Cleaning", "Upholstery Cleaning"],
    location: "Miami",
    address: "555 Beach Blvd, Miami, FL 33101",
    planned: "2023-06-05T11:30",
    price: 180,
    status: "scheduled",
    assignedTo: [{ name: "Olivia", id: "olivia" }],
    phone: "305-555-6789",
    priority: true,
    moreInfo: "Pet-friendly cleaning products requested",
  },
  {
    id: 6,
    created: "2023-06-04T16:00",
    services: ["Move-out Cleaning"],
    location: "Seattle",
    address: "777 Pine St, Seattle, WA 98101",
    planned: "2023-06-06T09:00",
    price: 275,
    status: "confirmed",
    assignedTo: [{ name: "Ethan", id: "ethan" }, { name: "Zoe", id: "zoe" }],
    phone: "206-555-9876",
    priority: false,
    moreInfo: "Large apartment, needs to be ready for new tenants",
  },
  {
    id: 7,
    created: "2023-06-05T10:30",
    services: ["Commercial Kitchen Cleaning"],
    location: "Boston",
    address: "888 Restaurant Row, Boston, MA 02101",
    planned: "2023-06-07T22:00",
    price: 400,
    status: "scheduled",
    assignedTo: [{ name: "Chris", id: "chris" }, { name: "Maria", id: "maria" }],
    phone: "617-555-3456",
    priority: true,
    moreInfo: "After-hours cleaning, industrial equipment handling required",
  },
  {
    id: 8,
    created: "2023-06-06T13:15",
    services: ["Residential Deep Cleaning"],
    location: "San Francisco",
    address: "999 Hill St, San Francisco, CA 94101",
    planned: "2023-06-08T14:00",
    price: 220,
    status: "confirmed",
    assignedTo: [{ name: "Alex", id: "alex" }],
    phone: "415-555-7890",
    priority: false,
    moreInfo: "Eco-friendly products requested, focus on allergen removal",
  },
  {
    id: 9,
    created: "2023-06-07T11:45",
    services: ["Pool Area Cleaning"],
    location: "Phoenix",
    address: "111 Desert Rd, Phoenix, AZ 85001",
    planned: "2023-06-09T08:00",
    price: 150,
    status: "scheduled",
    assignedTo: [{ name: "Daniel", id: "daniel" }],
    phone: "602-555-2345",
    priority: false,
    moreInfo: "Includes deck cleaning and furniture arrangement",
  },
  {
    id: 10,
    created: "2023-06-08T15:30",
    services: ["Post-Event Cleanup"],
    location: "Las Vegas",
    address: "222 Casino Ave, Las Vegas, NV 89101",
    planned: "2023-06-10T01:00",
    price: 500,
    status: "confirmed",
    assignedTo: [{ name: "Sophia", id: "sophia" }, { name: "Jack", id: "jack" }, { name: "Mia", id: "mia" }],
    phone: "702-555-6789",
    priority: true,
    moreInfo: "Large convention center, tight deadline before next event",
  },
  {
    id: 11,
    created: "2023-06-09T09:00",
    services: ["School Cleaning"],
    location: "Denver",
    address: "333 Education Blvd, Denver, CO 80201",
    planned: "2023-06-11T15:00",
    price: 350,
    status: "scheduled",
    assignedTo: [{ name: "Ryan", id: "ryan" }, { name: "Emily", id: "emily" }],
    phone: "303-555-1111",
    priority: false,
    moreInfo: "Summer break deep clean, includes classroom and gym areas",
  },
];

export default function BookingsPage() {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "date",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredBookings = [...bookings];

    if (hasSearchFilter) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.services.join(" ").toLowerCase().includes(filterValue.toLowerCase()) ||
        booking.location.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredBookings = filteredBookings.filter((booking) =>
        Array.from(statusFilter).includes(booking.status)
      );
    }

    return filteredBookings;
  }, [bookings, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Booking, b: Booking) => {
      const first = a[sortDescriptor.column as keyof Booking];
      const second = b[sortDescriptor.column as keyof Booking];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((booking: Booking, columnKey: React.Key) => {
    const cellValue = booking[columnKey as keyof Booking];

    switch (columnKey) {
      case "created":
      case "planned":
        return new Date(cellValue as string).toLocaleString();
      case "services":
        return (cellValue as string[]).join(", ");
      case "price":
        return `$${cellValue}`;
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[booking.status]} size="sm" variant="flat">
            {cellValue as string}
          </Chip>
        );
      case "assignedTo":
        return (
          <div className="flex flex-wrap gap-2">
            {(cellValue as { name: string; id: string }[]).map((member, index) => (
              <Link 
                href={`/team/${member.id}`} 
                key={index}
                className="text-white hover:underline"
              >
                {member.name}
              </Link>
            ))}
          </div>
        );
      case "phone":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" size="md">
                {cellValue as string}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Phone Actions">
              <DropdownItem key="call">Call</DropdownItem>
              <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem>View</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(()=>{
    setFilterValue("")
    setPage(1)
  },[])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by service or location..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" endContent={<PlusIcon />} onPress={() => setIsModalOpen(true)}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {bookings.length} bookings</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    bookings.length,
    hasSearchFilter,
    rowsPerPage,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onPreviousPage, onNextPage]);

  return (
    <section className="flex flex-col gap-4">
      <h1 className={title({ size: "sm" })}>Bookings</h1>
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[calc(100vh-200px)]",
          table: "min-h-[400px]",
        }}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No bookings found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal 
        size="3xl" 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            New Booking
          </ModalHeader>
          <ModalBody>
            <NewBookingForm onClose={() => setIsModalOpen(false)} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
}