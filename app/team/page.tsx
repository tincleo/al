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
  ModalFooter,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { BanknotesIcon } from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabaseClient";

import { PlusIcon } from "../components/PlusIcon";
import { ChevronDownIcon } from "../components/ChevronDownIcon";
import { SearchIcon } from "../components/SearchIcon";
import { capitalize } from "../utils";
import { title } from "../components/primitives";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { EyeIcon } from "../components/EyeIcon";
// Remove or comment out the PhoneIcon import
// import { PhoneIcon } from "../components/PhoneIcon";
import { UpdateBalanceModal } from "@/app/components/UpdateBalanceModal";

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  suspended: "danger",
};

const columns = [
  { name: "NAME", uid: "name", sortable: true },
  { name: "PHONE", uid: "phone1", sortable: true },
  { name: "ADDRESS", uid: "address", sortable: true },
  { name: "CONTRACT START", uid: "contract_start", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "SALARY", uid: "salary", sortable: true },
  { name: "CURRENT BALANCE", uid: "current_balance", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Suspended", uid: "suspended" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "phone1",
  "contract_start",
  "status",
  "current_balance",
  "actions",
];

type TeamMember = {
  id: number;
  name: string;
  phone1: string;
  email: string;
  address: string;
  contract_start: string;
  status: string;
  salary: number;
  current_balance: number;
  total_earned: number;
  jobs_executed: number;
  generated: number;
};

export default function TeamPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const [page, setPage] = React.useState(1);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: "",
    phone1: "",
    email: "",
    address: "",
    contract_start: new Date().toISOString().split("T")[0],
    status: "active",
    salary: 5000,
    current_balance: 0,
    total_earned: 0,
    jobs_executed: 0,
    generated: 0,
  });
  const [newMemberErrors, setNewMemberErrors] = useState<
    Partial<Record<keyof TeamMember, string>>
  >({});
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [balanceChange, setBalanceChange] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [balanceReason, setBalanceReason] = useState("");
  const [balanceNote, setBalanceNote] = useState("");
  const [isClearingBalance, setIsClearingBalance] = useState(false);
  const [isBalanceUpdateLoading, setIsBalanceUpdateLoading] = useState(false);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredMembers = [...teamMembers];

    if (hasSearchFilter) {
      filteredMembers = filteredMembers.filter((member) =>
        member.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredMembers = filteredMembers.filter((member) =>
        Array.from(statusFilter).includes(member.status),
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

  const renderCell = React.useCallback(
    (member: TeamMember, columnKey: React.Key) => {
      const cellValue = member[columnKey as keyof TeamMember];

      switch (columnKey) {
        case "status":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[member.status]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "salary":
        case "current_balance":
          return `${(cellValue as number).toLocaleString()} FCFA`;
        case "phone1":
          const formattedPhone = (cellValue as string).replace(
            /(\d{3})(\d{2})(\d{2})(\d{2})/,
            "$1 $2 $3 $4",
          );

          return (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  startContent={<WhatsAppIcon size={16} />}
                  variant="bordered"
                >
                  {formattedPhone}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Phone Actions">
                <DropdownItem key="call">Call</DropdownItem>
                <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        case "contract_start":
          return new Date(cellValue as string).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        case "actions":
          return (
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                color="primary"
                size="sm"
                variant="flat"
                onPress={() => router.push(`/team/${member.id}`)}
              >
                <EyeIcon size={16} />
              </Button>
              <Button
                isIconOnly
                color="success"
                size="sm"
                variant="flat"
                onPress={() => handleUpdateBalance(member)}
              >
                <BanknotesIcon className="w-4 h-4" />
              </Button>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [router],
  );

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

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const handleAddNewMember = () => {
    setNewMember({
      ...newMember,
      contract_start: new Date().toISOString().split("T")[0],
      salary: 5000,
    });
    setIsNewMemberModalOpen(true);
  };

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
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
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
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
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
            <Button
              color="primary"
              endContent={<PlusIcon />}
              onPress={handleAddNewMember}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {teamMembers.length} team members
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
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
    handleAddNewMember,
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
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [page, pages, onPreviousPage, onNextPage]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase.from("team").select("*");

    if (error) {
      toast.error(`Error fetching team members: ${error.message}`);
    } else if (data) {
      setTeamMembers(data);
    }
  };

  const validateNewMember = () => {
    const errors: Partial<Record<keyof TeamMember, string>> = {};

    if (!newMember.name?.trim()) errors.name = "Name is required";
    if (!newMember.phone1?.trim()) errors.phone1 = "Phone 1 is required";
    if (!newMember.email?.trim()) errors.email = "Email is required";
    if (!newMember.address?.trim()) errors.address = "Address is required";
    if (!newMember.contract_start)
      errors.contract_start = "Contract start date is required";
    if (!newMember.salary || newMember.salary <= 0)
      errors.salary = "Salary must be greater than 0";

    return errors;
  };

  const handleSaveNewMember = async () => {
    const validationErrors = validateNewMember();

    if (Object.keys(validationErrors).length > 0) {
      setNewMemberErrors(validationErrors);

      return;
    }

    const newMemberData = {
      ...newMember,
      current_balance: newMember.current_balance || 0,
      total_earned: 0,
      jobs_executed: 0,
      generated: 0,
    };

    const { data, error } = await supabase
      .from("team")
      .insert([newMemberData])
      .select();

    if (error) {
      toast.error(`Failed to add new member: ${error.message}`);
    } else if (data) {
      setTeamMembers([...teamMembers, data[0]]);
      setIsNewMemberModalOpen(false);
      setNewMember({
        name: "",
        phone1: "",
        email: "",
        address: "",
        contract_start: new Date().toISOString().split("T")[0],
        status: "active",
        salary: 5000,
        current_balance: 0,
        total_earned: 0,
        jobs_executed: 0,
        generated: 0,
      });
      setNewMemberErrors({});
      toast.success("New member added successfully!");
    }
  };

  const handleUpdateBalance = (member: TeamMember) => {
    setSelectedMember(member);
    setBalanceChange(member.salary.toString()); // Prefill with the member's salary
    setBalanceError("");
    setBalanceReason("Daily salary"); // Set default reason
    setIsBalanceModalOpen(true);
  };

  const handleConfirmBalanceUpdate = async () => {
    if (!selectedMember) return;

    setIsBalanceUpdateLoading(true);

    try {
      const changeAmount = parseFloat(balanceChange);

      if (isNaN(changeAmount) || changeAmount <= 0) {
        setBalanceError("Please enter a valid positive number");

        return;
      }

      if (!balanceReason) {
        setBalanceError("Please select a reason");

        return;
      }

      const finalChangeAmount =
        balanceReason === "Deduction" ? -changeAmount : changeAmount;

      const previousBalance = selectedMember.current_balance;
      const newBalance = Math.round(previousBalance + finalChangeAmount);

      let newTotalEarned = selectedMember.total_earned;

      if (balanceReason === "Daily salary" || balanceReason === "Bonus") {
        newTotalEarned += changeAmount;
      }

      const { error } = await supabase.rpc("update_balance_and_history", {
        p_member_id: selectedMember.id,
        p_new_balance: newBalance,
        p_new_total_earned: newTotalEarned,
        p_amount: finalChangeAmount,
        p_reason: balanceReason,
        p_previous_balance: previousBalance,
        p_notes: balanceNote || null,
      });

      if (error) {
        throw error;
      }

      setTeamMembers(
        teamMembers.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                current_balance: newBalance,
                total_earned: newTotalEarned,
              }
            : m,
        ),
      );

      setIsBalanceModalOpen(false);
      setBalanceError("");
      setBalanceReason("");
      setBalanceNote("");
      toast.success(
        `Balance ${finalChangeAmount > 0 ? "increased" : "decreased"} by ${Math.abs(finalChangeAmount).toLocaleString()} FCFA successfully!`,
      );
    } catch (error) {
      toast.error("Failed to update balance. Please try again.");
    } finally {
      setIsBalanceUpdateLoading(false);
    }
  };

  const handleClearBalance = async () => {
    if (
      !selectedMember ||
      selectedMember.current_balance === 0 ||
      isClearingBalance
    )
      return;

    setIsClearingBalance(true);

    try {
      const previousBalance = selectedMember.current_balance;
      const changeAmount = -previousBalance;

      const { error: updateError } = await supabase
        .from("team")
        .update({
          current_balance: 0,
          total_earned: selectedMember.total_earned + previousBalance,
        })
        .eq("id", selectedMember.id);

      if (updateError) {
        throw updateError;
      }

      const { error: historyError } = await supabase
        .from("balance_history")
        .insert({
          team_member_id: selectedMember.id,
          amount: changeAmount,
          type: "decrease",
          reason: "Balance cleared",
          previous_balance: previousBalance,
          new_balance: 0,
        });

      if (historyError) {
        throw historyError;
      }

      setTeamMembers(
        teamMembers.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                current_balance: 0,
                total_earned: m.total_earned + previousBalance,
              }
            : m,
        ),
      );

      setIsBalanceModalOpen(false);
      toast.success(
        `Balance cleared successfully. ${previousBalance.toLocaleString()} FCFA paid out.`,
      );
    } catch (error) {
      toast.error("Failed to clear balance. Please try again.");
    } finally {
      setIsClearingBalance(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className={title({ size: "sm" })}>Alpha Team</h1>
      <Table
        isHeaderSticky
        aria-label="Example table with custom cells, pagination and sorting"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[calc(100vh-200px)]", // Adjust 200px based on your layout
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
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isNewMemberModalOpen}
        onClose={() => {
          setIsNewMemberModalOpen(false);
          setNewMemberErrors({});
          setNewMember({
            name: "",
            phone1: "",
            email: "",
            address: "",
            contract_start: new Date().toISOString().split("T")[0],
            status: "active",
            salary: 5000,
            current_balance: 0,
            total_earned: 0,
            jobs_executed: 0,
            generated: 0,
          });
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Add New Team Member
          </ModalHeader>
          <ModalBody>
            <Input
              errorMessage={newMemberErrors.name}
              isInvalid={!!newMemberErrors.name}
              label="Name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
            />
            <Input
              errorMessage={newMemberErrors.email}
              isInvalid={!!newMemberErrors.email}
              label="Email"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
            />
            <Input
              errorMessage={newMemberErrors.phone1}
              isInvalid={!!newMemberErrors.phone1}
              label="Phone 1"
              value={newMember.phone1}
              onChange={(e) =>
                setNewMember({ ...newMember, phone1: e.target.value })
              }
            />
            <Input
              errorMessage={newMemberErrors.address}
              isInvalid={!!newMemberErrors.address}
              label="Address"
              value={newMember.address}
              onChange={(e) =>
                setNewMember({ ...newMember, address: e.target.value })
              }
            />
            <Input
              errorMessage={newMemberErrors.contract_start}
              isInvalid={!!newMemberErrors.contract_start}
              label="Contract Start Date"
              type="date"
              value={newMember.contract_start}
              onChange={(e) =>
                setNewMember({ ...newMember, contract_start: e.target.value })
              }
            />
            <Input
              endContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">/ day</span>
                </div>
              }
              errorMessage={newMemberErrors.salary}
              isInvalid={!!newMemberErrors.salary}
              label="Salary"
              type="number"
              value={newMember.salary?.toString()}
              onChange={(e) =>
                setNewMember({ ...newMember, salary: Number(e.target.value) })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setIsNewMemberModalOpen(false);
                setNewMemberErrors({});
                setNewMember({
                  name: "",
                  phone1: "",
                  email: "",
                  address: "",
                  contract_start: new Date().toISOString().split("T")[0],
                  status: "active",
                  salary: 5000,
                  current_balance: 0,
                  total_earned: 0,
                  jobs_executed: 0,
                  generated: 0,
                });
              }}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveNewMember}>
              Add Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <UpdateBalanceModal
        balanceChange={balanceChange}
        balanceError={balanceError}
        balanceNote={balanceNote}
        balanceReason={balanceReason}
        currentBalance={selectedMember?.current_balance || 0}
        handleClearBalance={handleClearBalance}
        handleConfirmBalanceUpdate={handleConfirmBalanceUpdate}
        isClearingBalance={isClearingBalance}
        isLoading={isBalanceUpdateLoading}
        isOpen={isBalanceModalOpen}
        memberName={selectedMember?.name || ""}
        setBalanceChange={setBalanceChange}
        setBalanceNote={setBalanceNote}
        setBalanceReason={setBalanceReason}
        onClose={() => {
          setIsBalanceModalOpen(false);
          setBalanceError("");
          setBalanceReason("");
          setBalanceNote("");
        }}
      />
    </section>
  );
}