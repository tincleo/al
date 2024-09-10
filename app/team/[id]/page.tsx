"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Divider, Chip, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Radio, RadioGroup, Badge, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { title } from "../../components/primitives";
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, PhoneIcon, UserGroupIcon, InformationCircleIcon, TrashIcon, PencilIcon, CheckIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, WalletIcon, BriefcaseIcon, CreditCardIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";

type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  contract_start: string;
  status: string;
  salary: number;
  current_balance: number;
  total_earned: number;
  jobs_executed: number;
  generated: number;
  created_at: string;
  contract_file: string | null;
  id_card_file: string | null;
};

export default function TeamMemberDetails() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceIncrease, setBalanceIncrease] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedMember, setEditedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  const fetchMemberDetails = async () => {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('id', memberId)
      .single();
    
    if (error) {
      console.error('Error fetching member details:', error);
    } else {
      setMember(data);
      setEditedMember(data);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('team')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error deleting member:', error);
    } else {
      router.push('/team');
    }
  };

  const handleMarkAsCompleted = () => {
    setIsBalanceModalOpen(true);
  };

  useEffect(() => {
    if (member) {
      setBalanceIncrease(Math.round(member.salary).toString());
    }
  }, [member]);

  const handleConfirmCompletion = async () => {
    if (!member) return;

    const increaseAmount = parseFloat(balanceIncrease);
    if (isNaN(increaseAmount) || increaseAmount <= 1) {
      setBalanceError("Amount must be greater than 1 FCFA");
      return;
    }

    const newBalance = Math.round(member.current_balance + increaseAmount);
    const { error } = await supabase
      .from('team')
      .update({ current_balance: newBalance })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating balance:', error);
    } else {
      setMember({ ...member, current_balance: newBalance });
      setIsBalanceModalOpen(false);
      setBalanceError("");
    }
  };

  const handleEditSave = async () => {
    if (!editedMember) return;

    const { error } = await supabase
      .from('team')
      .update(editedMember)
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member:', error);
    } else {
      setMember(editedMember);
      setIsEditModalOpen(false);
    }
  };

  const handleFileUpload = async (fileType: 'contract' | 'id_card') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileName = `${fileType}_${memberId}_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error } = await supabase.storage
          .from('alpha')
          .upload(fileName, file);

        if (error) {
          console.error(`Error uploading ${fileType}:`, error);
        } else {
          const { data: updateData, error: updateError } = await supabase
            .from('team')
            .update({ [`${fileType}_file`]: fileName })
            .eq('id', memberId);

          if (updateError) {
            console.error(`Error updating ${fileType} in database:`, updateError);
          } else {
            setMember(prev => prev ? { ...prev, [`${fileType}_file`]: fileName } : null);
          }
        }
      }
    };
    input.click();
  };

  const handleFileDownload = async (fileType: 'contract' | 'id_card') => {
    if (member && member[`${fileType}_file`]) {
      const { data, error } = await supabase.storage
        .from('alpha')
        .download(member[`${fileType}_file`]);

      if (error) {
        console.error(`Error downloading ${fileType}:`, error);
      } else {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = member[`${fileType}_file`].split('/').pop() || `${fileType}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  if (!member) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <WalletIcon className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-default-500">Current Balance</p>
                <p className="text-base font-semibold">{Math.round(member.current_balance)} FCFA</p>
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
              <p className="text-base font-semibold">{Math.round(member.total_earned)} FCFA</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center space-x-4">
            <BriefcaseIcon className="w-6 h-6 text-warning" />
            <div>
              <p className="text-xs text-default-500">Jobs Executed</p>
              <p className="text-base font-semibold">{member.jobs_executed}</p>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardBody className="flex flex-row items-center space-x-4">
            <CreditCardIcon className="w-6 h-6 text-danger" />
            <div>
              <p className="text-xs text-default-500">Generated</p>
              <p className="text-base font-semibold">{Math.round(member.generated)} FCFA</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
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
                      <DropdownItem key="call">Call</DropdownItem>
                      <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
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
                      <DropdownItem key="call">Call</DropdownItem>
                      <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
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
                <p>{new Date(member.contract_start).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Salary</p>
                <p>{Math.round(member.salary)} FCFA / day</p>
              </div>
              <div className="flex space-x-4">
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={member?.contract_file ? <CheckIcon className="w-4 h-4" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                    >
                      Contract
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Contract Actions">
                    {member?.contract_file ? (
                      <DropdownItem key="download" startContent={<ArrowDownTrayIcon className="w-4 h-4" />} onPress={() => handleFileDownload('contract')}>
                        Download
                      </DropdownItem>
                    ) : null}
                    <DropdownItem key="upload" startContent={<ArrowUpTrayIcon className="w-4 h-4" />} onPress={() => handleFileUpload('contract')}>
                      {member?.contract_file ? 'Replace' : 'Upload'}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      startContent={member?.id_card_file ? <CheckIcon className="w-4 h-4" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
                    >
                      ID Card
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="ID Card Actions">
                    {member?.id_card_file ? (
                      <DropdownItem key="download" startContent={<ArrowDownTrayIcon className="w-4 h-4" />} onPress={() => handleFileDownload('id_card')}>
                        Download
                      </DropdownItem>
                    ) : null}
                    <DropdownItem key="upload" startContent={<ArrowUpTrayIcon className="w-4 h-4" />} onPress={() => handleFileUpload('id_card')}>
                      {member?.id_card_file ? 'Replace' : 'Upload'}
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className={title({ size: 'sm' })}>Recent Jobs</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Table aria-label="Recent jobs" removeWrapper>
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>SERVICE</TableColumn>
                <TableColumn>LOCATION</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {/* Keep the existing static data for now */}
                <TableRow>
                  <TableCell>2023-06-01</TableCell>
                  <TableCell>Cleaning</TableCell>
                  <TableCell>New York</TableCell>
                  <TableCell>150 FCFA</TableCell>
                  <TableCell>
                    <Chip color="success" size="sm">Completed</Chip>
                  </TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created on: {new Date(member.created_at).toLocaleString()} by Admin
        </span>
        <div className="flex space-x-2">
          <Button color="primary" variant="bordered" startContent={<PencilIcon className="w-4 h-4" />} onPress={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
          <Button color="danger" variant="bordered" startContent={<TrashIcon className="w-4 h-4" />} onPress={() => setIsDeleteModalOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Edit User Infos</ModalHeader>
          <ModalBody>
            {editedMember && (
              <>
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
              </>
            )}
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
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isBalanceModalOpen} 
        onClose={() => {
          setIsBalanceModalOpen(false);
          setBalanceError("");
        }}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader>Increase Balance</ModalHeader>
          <ModalBody>
            <Input
              type="number"
              label="Increase balance by:"
              value={balanceIncrease}
              onChange={(e) => {
                setBalanceIncrease(e.target.value);
                setBalanceError("");
              }}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">FCFA</span>
                </div>
              }
              isInvalid={!!balanceError}
              errorMessage={balanceError}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => {
              setIsBalanceModalOpen(false);
              setBalanceError("");
            }}>
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