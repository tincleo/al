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
  SortDescriptor
} from "@nextui-org/react";
import { PlusIcon } from "../components/PlusIcon";
import { VerticalDotsIcon } from "../components/VerticalDotsIcon";
import { ChevronDownIcon } from "../components/ChevronDownIcon";
import { SearchIcon } from "../components/SearchIcon";
import { capitalize } from "../utils";
import { title } from "../components/primitives";
import { useRouter } from 'next/navigation';

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  suspended: "danger",
};

const columns = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "PHONE", uid: "phone", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "CONTRACT START", uid: "contractStart", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "SALARY", uid: "salary", sortable: true },
  { name: "CURRENT BALANCE", uid: "currentBalance", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Suspended", uid: "suspended" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "phone", "contractStart", "status", "salary", "currentBalance", "actions"];

type TeamMember = {
  id: number;
  name: string;
  phone: string;
  address: string;
  contractStart: string;
  status: string;
  salary: number;
  currentBalance: number;
};

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Arnauld Johnson",
    phone: "123-456-7890",
    address: "123 Main St, New York, NY 10001",
    contractStart: "2023-01-15",
    status: "active",
    salary: 45000,
    currentBalance: 2500,
  },
  {
    id: 2,
    name: "Prosper Smith",
    phone: "234-567-8901",
    address: "456 Elm St, Los Angeles, CA 90001",
    contractStart: "2023-02-01",
    status: "active",
    salary: 42000,
    currentBalance: 1800,
  },
  {
    id: 3,
    name: "Donovan Brown",
    phone: "345-678-9012",
    address: "789 Oak St, Chicago, IL 60601",
    contractStart: "2023-03-10",
    status: "suspended",
    salary: 40000,
    currentBalance: -500,
  },
  // Add more team members as needed...
];

export default function TeamPage() {
  const router = useRouter();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredMembers = [...teamMembers];

    if (hasSearchFilter) {
      filteredMembers = filteredMembers.filter((member) =>
        member.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== statusOptions.length) {
      filteredMembers = filteredMembers.filter((member) =>
        Array.from(statusFilter).includes(member.status)
      );
    }

    return filteredMembers;
  }, [teamMembers, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: TeamMember, b: TeamMember) => {
      const first = a[sortDescriptor.column as keyof TeamMember];
      const second = b[sortDescriptor.column as keyof TeamMember];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = React.useCallback((member: TeamMember, columnKey: React.Key) => {
    const cellValue = member[columnKey as keyof TeamMember];

    switch (columnKey) {
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[member.status]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "salary":
        return `$${cellValue.toLocaleString()}`;
      case "currentBalance":
        return `$${cellValue.toLocaleString()}`;
      case "phone":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
              >
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
          <Button 
            size="sm" 
            variant="flat" 
            color="primary"
            onPress={() => router.push(`/team/${member.id}`)}
          >
            View
          </Button>
        );
      default:
        return cellValue;
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
            placeholder="Search by name..."
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
            <Button color="primary" endContent={<PlusIcon />}>
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {teamMembers.length} team members</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
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
    teamMembers.length,
    hasSearchFilter,
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
      <h1 className={title({ size: "sm" })}>Team Management</h1>
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
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
        <TableBody emptyContent={"No team members found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}