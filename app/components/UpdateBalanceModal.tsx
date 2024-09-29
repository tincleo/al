import React, { useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea, Spinner } from "@nextui-org/react";
import { TrashIcon } from '@heroicons/react/24/outline';

interface UpdateBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  balanceChange: string;
  setBalanceChange: (value: string) => void;
  balanceError: string;
  balanceReason: string;
  setBalanceReason: (value: string) => void;
  balanceNote: string;
  setBalanceNote: (value: string) => void;
  handleConfirmBalanceUpdate: () => void;
  handleClearBalance: () => Promise<void>;
  currentBalance: number;
  isLoading: boolean;
  isClearingBalance: boolean;
}

export function UpdateBalanceModal({
  isOpen,
  onClose,
  memberName,
  balanceChange,
  setBalanceChange,
  balanceError,
  balanceReason,
  setBalanceReason,
  balanceNote,
  setBalanceNote,
  handleConfirmBalanceUpdate,
  handleClearBalance,
  currentBalance,
  isLoading,
  isClearingBalance
}: UpdateBalanceModalProps) {
  useEffect(() => {
    if (isOpen && !balanceReason) {
      setBalanceReason("Daily salary");
    }
  }, [isOpen, balanceReason, setBalanceReason]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader>Update Balance for {memberName}</ModalHeader>
        <ModalBody>
          <Input
            type="number"
            label="Amount:"
            value={balanceChange}
            onValueChange={setBalanceChange}
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">FCFA</span>
              </div>
            }
            description="Enter a positive value. The amount will be added or subtracted based on the reason."
            isInvalid={!!balanceError && balanceError !== "Please select a reason"}
            errorMessage={balanceError !== "Please select a reason" ? balanceError : ""}
          />
          <Select
            label="Reason"
            placeholder="Select a reason"
            value={balanceReason}
            onChange={(e) => setBalanceReason(e.target.value)}
            isRequired
            isInvalid={balanceError === "Please select a reason"}
            errorMessage={balanceError === "Please select a reason" ? balanceError : ""}
            selectedKeys={balanceReason ? [balanceReason] : []}
          >
            <SelectItem key="Daily salary" value="Daily salary">Daily salary (Increase)</SelectItem>
            <SelectItem key="Bonus" value="Bonus">Bonus (Increase)</SelectItem>
            <SelectItem key="Transport" value="Transport">Transport (Increase)</SelectItem>
            <SelectItem key="Deduction" value="Deduction">Deduction (Decrease)</SelectItem>
          </Select>
          <Textarea
            label="Note (optional)"
            placeholder="Enter any additional information"
            value={balanceNote}
            onValueChange={setBalanceNote}
          />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button 
            color="warning" 
            variant="flat" 
            onPress={handleClearBalance}
            isDisabled={currentBalance === 0 || isLoading || isClearingBalance}
            startContent={isClearingBalance ? <Spinner size="sm" /> : <TrashIcon className="w-4 h-4" />}
          >
            Clear Balance
          </Button>
          <div>
            <Button color="danger" variant="light" onPress={onClose} isDisabled={isLoading || isClearingBalance}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleConfirmBalanceUpdate}
              isLoading={isLoading}
              startContent={isLoading ? <Spinner size="sm" /> : null}
            >
              Submit
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}