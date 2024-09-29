"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Divider, Chip, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Radio, RadioGroup, Badge, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Switch, Pagination, Select, SelectItem } from "@nextui-org/react";
import { title } from "../../components/primitives";
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, PhoneIcon, UserGroupIcon, InformationCircleIcon, TrashIcon, PencilIcon, CheckIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, WalletIcon, BriefcaseIcon, CreditCardIcon, PlusIcon, CameraIcon, ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from 'react-hot-toast';
import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import { TopMenu } from '../../components/top-menu';
import { UpdateBalanceModal } from "../../components/UpdateBalanceModal";

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

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null) return '0 FCFA';
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\s/g, '.') + ' FCFA';
};

const getAvatarUrl = (fileName: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/alpha/${fileName}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', // This will use short month names (e.g., Sep instead of September)
    day: 'numeric'
  }) + ' at ' + date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default function TeamMemberDetails() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string ?? '';
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceChange, setBalanceChange] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedMember, setEditedMember] = useState<TeamMember | null>(null);
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({
    contract: false,
    id_card: false
  });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof TeamMember, string>>>({});
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isClearBalanceModalOpen, setIsClearBalanceModalOpen] = useState(false);
  const [balanceHistoryPage, setBalanceHistoryPage] = useState(1);
  const balanceHistoryPerPage = 6;
  const [balanceReason, setBalanceReason] = useState("");
  const [balanceHistory, setBalanceHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchMemberDetails();
  }, [memberId]);

  useEffect(() => {
    if (memberId) {
      fetchBalanceHistory();
    }
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
      const memberWithAvatarUrl = {
        ...data,
        avatar: data.avatar ? getAvatarUrl(data.avatar) : null
      };
      setMember(memberWithAvatarUrl);
      setEditedMember(memberWithAvatarUrl);
    }
  };

  const fetchBalanceHistory = async () => {
    const { data, error } = await supabase
      .from('balance_history')
      .select('id, amount, type, reason, previous_balance, new_balance, created_at')
      .eq('team_member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching balance history:', error);
    } else {
      setBalanceHistory(data);
    }
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);
    const { error } = await supabase
      .from('team')
      .delete()
      .eq('id', memberId);

    if (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member. Please try again.');
    } else {
      toast.success('Team member deleted successfully!');
      router.push('/team');
    }
  };

  const handleMarkAsCompleted = () => {
    setIsBalanceModalOpen(true);
  };

  useEffect(() => {
    if (member) {
      setBalanceChange(Math.round(member.salary).toString());
    }
  }, [member]);

  const handleConfirmBalanceUpdate = async () => {
    if (!member) return;

    const changeAmount = parseFloat(balanceChange);
    if (isNaN(changeAmount) || changeAmount <= 0) {
      setBalanceError("Please enter a valid positive number");
      return;
    }

    if (!balanceReason) {
      setBalanceError("Please select a reason");
      return;
    }

    let finalChangeAmount = balanceReason === "Deduction" ? -changeAmount : changeAmount;

    const previousBalance = member.current_balance;
    const newBalance = Math.round(previousBalance + finalChangeAmount);

    const { error: updateError } = await supabase
      .from('team')
      .update({ current_balance: newBalance })
      .eq('id', memberId);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      toast.error('Failed to update balance. Please try again.');
      return;
    }

    const { error: historyError } = await supabase
      .from('balance_history')
      .insert({
        team_member_id: memberId,
        amount: finalChangeAmount,
        type: finalChangeAmount > 0 ? 'increase' : 'decrease',
        reason: capitalizeFirstLetter(balanceReason), // Remove the conditional here
        previous_balance: previousBalance,
        new_balance: newBalance
      });

    if (historyError) {
      console.error('Error recording balance history:', historyError);
      toast.error('Failed to record balance history. Please try again.');
    } else {
      setMember({ ...member, current_balance: newBalance });
      setIsBalanceModalOpen(false);
      setBalanceError("");
      setBalanceReason("");
      toast.success(`Balance ${finalChangeAmount > 0 ? 'increased' : 'decreased'} by ${Math.abs(finalChangeAmount).toLocaleString()} FCFA successfully!`);
      fetchBalanceHistory(); // Refresh balance history
    }
  };

  const validateEditedMember = () => {
    const errors: Partial<Record<keyof TeamMember, string>> = {};
    if (!editedMember) return errors;

    if (!editedMember.name.trim()) errors.name = "Name is required";
    if (!editedMember.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(editedMember.email)) errors.email = "Invalid email format";
    if (!editedMember.phone1.trim()) errors.phone1 = "Phone 1 is required";
    if (!editedMember.address.trim()) errors.address = "Address is required";
    if (!editedMember.contract_start) errors.contract_start = "Contract start date is required";
    if (editedMember.salary <= 0) errors.salary = "Salary must be greater than 0";

    return errors;
  };

  const handleEditSave = async () => {
    if (!editedMember) return;

    const validationErrors = validateEditedMember();
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    const { error } = await supabase
      .from('team')
      .update(editedMember)
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member details. Please try again.');
    } else {
      setMember(editedMember);
      setIsEditModalOpen(false);
      setEditErrors({});
      toast.success('Member details updated successfully!');
    }
  };

  const handleFileUpload = async (fileType: 'contract' | 'id_card') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsUploading(prev => ({ ...prev, [fileType]: true }));
        const fileName = `${fileType}_${memberId}_${Date.now()}.${file.name.split('.').pop()}`;
        
        try {
          // Check if the bucket exists and create it if it doesn't
          const { data: bucketData, error: bucketError } = await supabase
            .storage
            .getBucket('alpha');

          if (bucketError && 'statusCode' in bucketError && bucketError.statusCode === '404') {
            const { data: createBucketData, error: createBucketError } = await supabase
              .storage
              .createBucket('alpha', { public: false });

            if (createBucketError) {
              throw new Error('Error creating bucket: ' + createBucketError.message);
            }
          } else if (bucketError) {
            throw new Error('Error checking bucket: ' + bucketError.message);
          }

          // Upload the file
          const { data, error } = await supabase.storage
            .from('alpha')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw new Error(`Error uploading ${fileType}: ` + error.message);
          }

          // Update the database
          const { data: updateData, error: updateError } = await supabase
            .from('team')
            .update({ [`${fileType}_file`]: fileName })
            .eq('id', memberId);

          if (updateError) {
            throw new Error(`Error updating ${fileType} in database: ` + updateError.message);
          }

          setMember(prev => prev ? { ...prev, [`${fileType}_file`]: fileName } : null);
          toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully!`);
        } catch (error) {
          console.error(error);
          toast.error(error instanceof Error ? error.message : 'An error occurred during upload');
        } finally {
          setIsUploading(prev => ({ ...prev, [fileType]: false }));
        }
      }
    };
    input.click();
  };

  const handleFileDownload = async (fileType: 'contract' | 'id_card') => {
    if (member && member[`${fileType}_file`]) {
      const { data, error } = await supabase.storage
        .from('alpha')
        .download(member[`${fileType}_file`] as string);

      if (error) {
        console.error(`Error downloading ${fileType}:`, error);
        toast.error(`Error downloading ${fileType}`);
      } else {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = member[`${fileType}_file`]?.split('/').pop() || `${fileType}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} downloaded successfully!`);
      }
    }
  };

  const calculateTimeSinceContractStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = differenceInYears(now, start);
    const months = differenceInMonths(now, start) % 12;
    const weeks = differenceInWeeks(now, start) % 4;
    const days = differenceInDays(now, start) % 7;

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
    if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);

    return parts.join(', ');
  };

  const handleAvatarUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && member) {
      setIsUpdatingAvatar(true);
      const fileName = `avatar_${memberId}_${Date.now()}.${file.name.split('.').pop()}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('alpha')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw new Error(`Error uploading avatar: ${error.message}`);
        }

        const { data: updateData, error: updateError } = await supabase
          .from('team')
          .update({ avatar: fileName })
          .eq('id', memberId);

        if (updateError) {
          throw new Error(`Error updating avatar in database: ${updateError.message}`);
        }

        const avatarUrl = getAvatarUrl(fileName);
        setMember({ ...member, avatar: avatarUrl });
        toast.success('Avatar updated successfully!');
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'An error occurred during avatar update');
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  };

  const handleClearBalance = async () => {
    if (!member || member.current_balance === 0) {
      setIsBalanceModalOpen(false);
      return;
    }

    const previousBalance = member.current_balance;
    const changeAmount = -previousBalance;

    const { error: updateError } = await supabase
      .from('team')
      .update({ current_balance: 0, total_earned: member.total_earned + previousBalance })
      .eq('id', memberId);

    if (updateError) {
      console.error('Error clearing balance:', updateError);
      toast.error('Failed to clear balance. Please try again.');
      return;
    }

    const { error: historyError } = await supabase
      .from('balance_history')
      .insert({
        team_member_id: memberId,
        amount: changeAmount,
        type: 'decrease',
        reason: 'Balance cleared',
        previous_balance: previousBalance,
        new_balance: 0
      });

    if (historyError) {
      console.error('Error recording balance history:', historyError);
      toast.error('Failed to record balance history. Please try again.');
    } else {
      setMember({ ...member, current_balance: 0, total_earned: member.total_earned + previousBalance });
      setIsBalanceModalOpen(false);
      toast.success(`Balance cleared successfully. ${previousBalance.toLocaleString()} FCFA paid out.`);
      fetchBalanceHistory(); // Refresh balance history
    }
  };

  if (!member) return <div>Loading...</div>;

  return (
    <>
      <div className="space-y-6">
        <Toaster position="top-center" reverseOrder={false} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardBody className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <WalletIcon className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-xs text-default-500">Current Balance</p>
                  <p className="text-base font-semibold">{formatCurrency(member.current_balance)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="flat" 
                  onPress={() => setIsBalanceModalOpen(true)}
                  className="bg-default-100 hover:bg-blue-500 hover:text-white transition-colors"
                  isIconOnly
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardBody className="flex flex-row items-center space-x-4">
              <CurrencyDollarIcon className="w-6 h-6 text-success" />
              <div>
                <p className="text-xs text-default-500">Total Earned</p>
                <p className="text-base font-semibold">{formatCurrency(member.total_earned)}</p>
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
                <p className="text-base font-semibold">{formatCurrency(member.generated)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{member.name}'s Info</h2>
              <Chip color={member.status === 'active' ? 'success' : 'danger'}>
                {member.status}
              </Chip>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <Avatar 
                      src={member.avatar}
                      size="lg" 
                      showFallback 
                      alt={`${member.name}'s avatar`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        {isUpdatingAvatar ? (
                          <Spinner size="sm" color="white" />
                        ) : (
                          <CameraIcon className="w-6 h-6 text-white" />
                        )}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpdate}
                        disabled={isUpdatingAvatar}
                      />
                    </div>
                  </div>
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
                        <Button variant="bordered" size="md" startContent={<PhoneIcon className="w-4 h-4" />}>
                          {member.phone1}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Phone Actions">
                        <DropdownItem key="call">Call</DropdownItem>
                        <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  {member.phone2 && (
                    <div>
                      <p className="text-sm text-default-500">Phone 2</p>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="bordered" size="md" startContent={<PhoneIcon className="w-4 h-4" />}>
                            {member.phone2}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Phone Actions">
                          <DropdownItem key="call">Call</DropdownItem>
                          <DropdownItem key="whatsapp">WhatsApp</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-default-500">Address</p>
                  <p>{member.address}</p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Contract Start</p>
                  <p>
                    {new Date(member.contract_start).toLocaleDateString()}
                    {' '}
                    <span className="text-sm text-default-500">
                      ({calculateTimeSinceContractStart(member.contract_start)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Salary</p>
                  <p>{formatCurrency(member.salary)} / day</p>
                </div>
                <div className="flex space-x-4">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={
                          isUploading.contract ? null : (
                            member?.contract_file ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <ArrowUpTrayIcon className="w-4 h-4" />
                            )
                          )
                        }
                        isLoading={isUploading.contract}
                      >
                        {isUploading.contract ? "Uploading..." : "Contract"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Contract Actions">
                      {member?.contract_file && (
                        <DropdownItem key="download" startContent={<ArrowDownTrayIcon className="w-4 h-4" />} onPress={() => handleFileDownload('contract')}>
                          Download
                        </DropdownItem>
                      )}
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
                        startContent={
                          isUploading.id_card ? null : (
                            member?.id_card_file ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <ArrowUpTrayIcon className="w-4 h-4" />
                            )
                          )
                        }
                        isLoading={isUploading.id_card}
                      >
                        {isUploading.id_card ? "Uploading..." : "ID Card"}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="ID Card Actions">
                      {member?.id_card_file && (
                        <DropdownItem key="download" startContent={<ArrowDownTrayIcon className="w-4 h-4" />} onPress={() => handleFileDownload('id_card')}>
                          Download
                        </DropdownItem>
                      )}
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
              <h2 className="text-lg font-semibold">Balance History</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                {balanceHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-default-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${entry.type === 'increase' ? 'bg-success-100' : 'bg-danger-100'}`}>
                        {entry.type === 'increase' ? (
                          <ArrowUpIcon className="w-4 h-4 text-success-500" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4 text-danger-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{capitalizeFirstLetter(entry.reason)}</p>
                        <p className="text-xs text-default-400">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${entry.type === 'increase' ? 'text-success-500' : 'text-danger-500'}`}>
                        {entry.type === 'increase' ? '+' : '-'} {Math.abs(entry.amount).toLocaleString()} FCFA
                      </div>
                      <p className="text-xs text-default-400 flex items-center justify-end space-x-2">
                        <span className="flex items-center">
                          <ArrowLeftIcon className="w-3 h-3 mr-1" />
                          {entry.previous_balance?.toLocaleString() ?? 'N/A'} FCFA
                        </span>
                        <span>|</span>
                        <span className="flex items-center">
                          <ArrowRightIcon className="w-3 h-3 mr-1" />
                          {entry.new_balance?.toLocaleString() ?? 'N/A'} FCFA
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(balanceHistory.length / balanceHistoryPerPage)}
                  page={balanceHistoryPage}
                  onChange={setBalanceHistoryPage}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="p-4">
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
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
                  <TableCell>{formatCurrency(150)}</TableCell>
                  <TableCell>
                    <Chip color="success" size="sm">Completed</Chip>
                  </TableCell>
                </TableRow>
                {/* Add more rows as needed */}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

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
          onClose={() => {
            setIsEditModalOpen(false);
            setEditErrors({});
          }}
        >
          <ModalContent>
            <ModalHeader>Edit User Info</ModalHeader>
            <ModalBody>
              {editedMember && (
                <>
                  <Input
                    label="Name"
                    value={editedMember.name}
                    onChange={(e) => setEditedMember({...editedMember, name: e.target.value})}
                    isInvalid={!!editErrors.name}
                    errorMessage={editErrors.name}
                  />
                  <Input
                    label="Email"
                    value={editedMember.email}
                    onChange={(e) => setEditedMember({...editedMember, email: e.target.value})}
                    isInvalid={!!editErrors.email}
                    errorMessage={editErrors.email}
                  />
                  <Input
                    label="Phone 1"
                    value={editedMember.phone1}
                    onChange={(e) => setEditedMember({...editedMember, phone1: e.target.value})}
                    isInvalid={!!editErrors.phone1}
                    errorMessage={editErrors.phone1}
                  />
                  <Input
                    label="Phone 2 (Optional)"
                    value={editedMember.phone2}
                    onChange={(e) => setEditedMember({...editedMember, phone2: e.target.value})}
                  />
                  <Input
                    label="Address"
                    value={editedMember.address}
                    onChange={(e) => setEditedMember({...editedMember, address: e.target.value})}
                    isInvalid={!!editErrors.address}
                    errorMessage={editErrors.address}
                  />
                  <Input
                    label="Contract Start Date"
                    type="date"
                    value={editedMember.contract_start.split('T')[0]}
                    onChange={(e) => setEditedMember({...editedMember, contract_start: e.target.value})}
                    isInvalid={!!editErrors.contract_start}
                    errorMessage={editErrors.contract_start}
                  />
                  <Input
                    label="Salary"
                    type="number"
                    value={editedMember.salary.toString()}
                    onChange={(e) => setEditedMember({...editedMember, salary: Number(e.target.value)})}
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-default-400 text-small">/ day</span></div>}
                    isInvalid={!!editErrors.salary}
                    errorMessage={editErrors.salary}
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => {
                setIsEditModalOpen(false);
                setEditErrors({});
              }}>
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

        <UpdateBalanceModal
          isOpen={isBalanceModalOpen}
          onClose={() => {
            setIsBalanceModalOpen(false);
            setBalanceError("");
            setBalanceReason("");
          }}
          memberName={member?.name || ''}
          balanceChange={balanceChange}
          setBalanceChange={setBalanceChange}
          balanceError={balanceError}
          balanceReason={balanceReason}
          setBalanceReason={setBalanceReason}
          handleConfirmBalanceUpdate={handleConfirmBalanceUpdate}
          handleClearBalance={handleClearBalance}
          currentBalance={member?.current_balance || 0}
        />

        <Modal 
          isOpen={isClearBalanceModalOpen} 
          onClose={() => setIsClearBalanceModalOpen(false)}
          backdrop="blur"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">Clear Balance</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to clear the current balance?</p>
              <p>Current balance of {formatCurrency(member.current_balance)} will be added to Total Earned.</p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={() => setIsClearBalanceModalOpen(false)}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleClearBalance}>
                Clear Balance
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}