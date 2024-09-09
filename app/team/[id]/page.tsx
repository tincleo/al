"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Divider, Chip, Avatar, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { title, subtitle } from "../../components/primitives";
import { WalletIcon, CurrencyDollarIcon, BriefcaseIcon, CreditCardIcon, DocumentTextIcon, IdentificationIcon, PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, CheckIcon } from '@heroicons/react/24/outline';

// This would typically come from an API or database
const getMemberDetails = (id: string) => {
  // Placeholder data
  return {
    id: parseInt(id),
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    phone1: "123-456-7890",
    phone2: "098-765-4321",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA",
    contractStart: "2023-01-15",
    status: "active",
    salary: 45000,
    currentBalance: 2500,
    totalEarned: 22500,
    jobsExecuted: 45,
    generated: 150000,
    recentJobs: [
      { id: 1, date: "2023-06-01", service: "House Cleaning", location: "New York", price: 150, status: "completed" },
      { id: 2, date: "2023-06-02", service: "Car Cleaning", location: "Los Angeles", price: 80, status: "scheduled" },
      { id: 3, date: "2023-06-03", service: "Office Cleaning", location: "Chicago", price: 200, status: "in progress" },
      // ... add more jobs
    ],
  };
};

export default function TeamMemberDetails() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [member, setMember] = React.useState(getMemberDetails(memberId));
  const [isBalanceModalOpen, setIsBalanceModalOpen] = React.useState(false);
  const [balanceIncrease, setBalanceIncrease] = React.useState(member.salary.toString());
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [editedMember, setEditedMember] = React.useState(member);

  const handleBalanceIncrease = () => {
    // Implement balance increase logic here
    console.log("Increasing balance by:", balanceIncrease);
    setIsBalanceModalOpen(false);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    setMember(editedMember);
    setIsEditModalOpen(false);
    // Here you would typically send the updated data to your backend
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Implement delete logic here
    console.log("Deleting member:", memberId);
    setIsDeleteModalOpen(false);
    // After deletion, navigate back to team list
    router.push('/team');
  };

  const handleReplaceContract = () => {
    // Implement file picker logic here
    console.log("Replacing contract");
  };

  const handleReplaceIDCard = () => {
    // Implement file picker logic here
    console.log("Replacing ID Card");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <WalletIcon className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-default-500">Current Balance</p>
                <p className="text-base font-semibold">{member.currentBalance.toLocaleString()} FCFA</p>
              </div>
            </div>
            <Button 
              isIconOnly 
              size="sm" 
              variant="flat" 
              onPress={() => setIsBalanceModalOpen(true)}
              className="bg-default-100 hover:bg-blue-500 hover:text-white transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center space-x-4">
            <CurrencyDollarIcon className="w-6 h-6 text-success" />
            <div>
              <p className="text-xs text-default-500">Total Earned</p>
              <p className="text-base font-semibold">{member.totalEarned.toLocaleString()} FCFA</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center space-x-4">
            <BriefcaseIcon className="w-6 h-6 text-warning" />
            <div>
              <p className="text-xs text-default-500">Jobs Executed</p>
              <p className="text-base font-semibold">{member.jobsExecuted}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center space-x-4">
            <CreditCardIcon className="w-6 h-6 text-danger" />
            <div>
              <p className="text-xs text-default-500">Generated</p>
              <p className="text-base font-semibold">{member.generated.toLocaleString()} FCFA</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className={title({ size: 'sm' })}>{member.name}'s Info</h2>
            <Chip color={member.status === 'active' ? 'success' : 'danger'}>
              {member.status}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar src={member.avatar} size="lg" />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-default-500">{member.email}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div>
                  <p className="text-sm text-default-500">Phone 1</p>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" size="md">
                        {member.phone1}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Phone Actions">
                      <DropdownItem key="call" onPress={() => window.location.href = `tel:${member.phone1}`}>
                        Call
                      </DropdownItem>
                      <DropdownItem key="whatsapp" onPress={() => window.open(`https://wa.me/${member.phone1.replace(/\D/g,'')}`, '_blank')}>
                        WhatsApp
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div>
                  <p className="text-sm text-default-500">Phone 2</p>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="bordered" size="md">
                        {member.phone2}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Phone Actions">
                      <DropdownItem key="call" onPress={() => window.location.href = `tel:${member.phone2}`}>
                        Call
                      </DropdownItem>
                      <DropdownItem key="whatsapp" onPress={() => window.open(`https://wa.me/${member.phone2.replace(/\D/g,'')}`, '_blank')}>
                        WhatsApp
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
              <div>
                <p className="text-sm text-default-500">Address</p>
                <p>{member.address}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Contract Start</p>
                <p>{member.contractStart}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Salary</p>
                <p>{member.salary.toLocaleString()} FCFA / day</p>
              </div>
              <div className="flex space-x-4">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<CheckIcon className="w-4 h-4" />}
                    >
                      Contract
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Contract Actions">
                    <DropdownItem 
                      key="download" 
                      startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      Download
                    </DropdownItem>
                    <DropdownItem 
                      key="replace" 
                      startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
                      onPress={handleReplaceContract}
                    >
                      Replace
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      startContent={<CheckIcon className="w-4 h-4" />}
                    >
                      ID Card
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="ID Card Actions">
                    <DropdownItem 
                      key="download" 
                      startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
                    >
                      Download
                    </DropdownItem>
                    <DropdownItem 
                      key="replace" 
                      startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
                      onPress={handleReplaceIDCard}
                    >
                      Replace
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className={title({ size: 'sm' })}>Recent Jobs</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Table 
              aria-label="Recent jobs"
              removeWrapper
            >
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>SERVICE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {member.recentJobs.slice(0, 10).map((job) => (
                  <TableRow key={job.id} className="cursor-pointer" onClick={() => router.push(`/bookings/${job.id}`)}>
                    <TableCell>{job.date}</TableCell>
                    <TableCell>{job.service}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.price.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Chip color={job.status === 'completed' ? 'success' : job.status === 'in progress' ? 'primary' : 'warning'} size="sm">
                        {job.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button 
          color="primary" 
          variant="bordered" 
          startContent={<PencilIcon className="w-4 h-4" />}
          onPress={handleEdit}
        >
          Edit
        </Button>
        <Button 
          color="danger" 
          variant="bordered" 
          startContent={<TrashIcon className="w-4 h-4" />}
          onPress={handleDelete}
        >
          Delete
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Edit User Infos</ModalHeader>
          <ModalBody>
            <Input
              label="Name"
              value={editedMember.name}
              onChange={(e) => setEditedMember({...editedMember, name: e.target.value})}
            />
            <Input
              label="Email"
              value={editedMember.email}
              onChange={(e) => setEditedMember({...editedMember, email: e.target.value})}
            />
            <Input
              label="Phone 1"
              value={editedMember.phone1}
              onChange={(e) => setEditedMember({...editedMember, phone1: e.target.value})}
            />
            <Input
              label="Phone 2"
              value={editedMember.phone2}
              onChange={(e) => setEditedMember({...editedMember, phone2: e.target.value})}
            />
            <Input
              label="Address"
              value={editedMember.address}
              onChange={(e) => setEditedMember({...editedMember, address: e.target.value})}
            />
            <Input
              label="Salary"
              type="number"
              value={editedMember.salary.toString()}
              onChange={(e) => setEditedMember({...editedMember, salary: Number(e.target.value)})}
              endContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-small">/ day</span></div>}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleEditSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
          <ModalBody>
            <p className="text-danger">Warning: This action cannot be undone.</p>
            <p>Are you sure you want to delete {member.name} from the team?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isBalanceModalOpen} 
        onClose={() => setIsBalanceModalOpen(false)}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Increase Balance</ModalHeader>
          <ModalBody>
            <Input
              type="number"
              label="Increase balance by:"
              value={balanceIncrease}
              onChange={(e) => setBalanceIncrease(e.target.value)}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">FCFA</span>
                </div>
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsBalanceModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleBalanceIncrease}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}