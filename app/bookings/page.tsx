"use client";

import React, { useEffect, useState } from "react";
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
  Avatar,
  AvatarGroup,
} from "@nextui-org/react";
import { PlusIcon } from "../components/PlusIcon";
import { VerticalDotsIcon } from "../components/VerticalDotsIcon";
import { ChevronDownIcon } from "../components/ChevronDownIcon";
import { SearchIcon } from "../components/SearchIcon";
import { capitalize } from "../utils";
import { title } from "../components/primitives";
import { NewBookingForm } from "../components/NewBookingForm";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';
import { formatDate } from "../utils"; // Assume we'll create this function
import { formatPrice } from "../utils"; // We'll create this function
import { Toaster } from 'react-hot-toast';

const statusColorMap: Record<string, ChipProps["color"]> = {
  scheduled: "primary",
  confirmed: "success",
  completed: "secondary",
  canceled: "danger",
};

const columns = [
  { name: "CREATED", uid: "created_at", sortable: true },
  { name: "ID", uid: "id", sortable: true },
  { name: "SERVICES", uid: "services", sortable: true },
  { name: "LOCATION", uid: "location", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "PLANNED", uid: "planned_at", sortable: true },
  { name: "PRICE", uid: "price", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ASSIGNED TO", uid: "assigned_to", sortable: true },
  { name: "PHONE", uid: "client_phone", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Scheduled", uid: "scheduled" },
  { name: "Confirmed", uid: "confirmed" },
  { name: "Completed", uid: "completed" },
  { name: "Canceled", uid: "canceled" },
];

const INITIAL_VISIBLE_COLUMNS = ["created_at", "services", "location", "planned_at", "price", "status", "assigned_to", "client_phone"];

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
  more_info: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(10); // Set default to 10 rows
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "date",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const router = useRouter();

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

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
      case "created_at":
      case "planned_at":
        return formatDate(cellValue as string);
      case "services":
        return (cellValue as string[]).join(", ");
      case "price":
        return `${formatPrice(cellValue as number)} FCFA`;  // Add FCFA suffix here
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[booking.status]} size="sm" variant="flat">
            {cellValue as string}
          </Chip>
        );
      case "assigned_to":
        return (
          <AvatarGroup isBordered max={3}>
            {(Array.isArray(cellValue) ? cellValue : []).map((member, index) => (
              typeof member === 'object' && member !== null ? (
                <Avatar 
                  key={index}
                  name={member.name}
                  src={`https://i.pravatar.cc/150?u=${member.id}`} // Using a placeholder avatar service
                  size="sm"
                />
              ) : null
            ))}
          </AvatarGroup>
        );
      case "client_phone":
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
                <DropdownItem onPress={() => router.push(`/bookings/${booking.id}`)}>
                  View
                </DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      case "address":
        return cellValue as string;
      default:
        return cellValue as React.ReactNode;
    }
  }, [router]);

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

  const handleBookingCreated = () => {
    setIsModalOpen(false);
    fetchBookings(); // Refresh the bookings list
  };

  return (
    <section className="flex flex-col gap-4">
      <Toaster position="top-right" />
      <h1 className={title({ size: "sm" })}>Bookings</h1>
      {loading ? (
        <p>Loading bookings...</p>
      ) : (
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
              <TableRow 
                key={item.id} 
                className="cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => router.push(`/bookings/${item.id}`)}
              >
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

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
            <NewBookingForm 
              onClose={() => setIsModalOpen(false)} 
              onBookingCreated={handleBookingCreated}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
}