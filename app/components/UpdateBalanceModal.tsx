import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  isClearingBalance,
}: UpdateBalanceModalProps) {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !balanceReason) {
      setBalanceReason("Daily salary");
    }
  }, [isOpen, balanceReason, setBalanceReason]);

  const handleClearBalanceClick = () => {
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClear = async () => {
    setIsClearConfirmOpen(false);
    await handleClearBalance();
  };

  const isActionInProgress =
    isLoading || isClearingBalance || isClearConfirmOpen;

  return (
    <>
      <Modal isDismissable={false} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Update Balance for {memberName}</ModalHeader>
          <ModalBody>
            <Input
              description="Enter a positive value. The amount will be added or subtracted based on the reason."
              errorMessage={
                balanceError !== "Please select a reason" ? balanceError : ""
              }
              isDisabled={isActionInProgress}
              isInvalid={
                !!balanceError && balanceError !== "Please select a reason"
              }
              label="Amount:"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">FCFA</span>
                </div>
              }
              type="number"
              value={balanceChange}
              onValueChange={setBalanceChange}
            />
            <Select
              isRequired
              errorMessage={
                balanceError === "Please select a reason" ? balanceError : ""
              }
              isDisabled={isActionInProgress}
              isInvalid={balanceError === "Please select a reason"}
              label="Reason"
              placeholder="Select a reason"
              selectedKeys={balanceReason ? [balanceReason] : []}
              value={balanceReason}
              onChange={(e) => setBalanceReason(e.target.value)}
            >
              <SelectItem key="Daily salary" value="Daily salary">
                Daily salary (Increase)
              </SelectItem>
              <SelectItem key="Bonus" value="Bonus">
                Bonus (Increase)
              </SelectItem>
              <SelectItem key="Transport" value="Transport">
                Transport (Increase)
              </SelectItem>
              <SelectItem key="Deduction" value="Deduction">
                Deduction (Decrease)
              </SelectItem>
            </Select>
            <Textarea
              isDisabled={isActionInProgress}
              label="Note (optional)"
              placeholder="Enter any additional information"
              value={balanceNote}
              onValueChange={setBalanceNote}
            />
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button
              color="warning"
              isDisabled={currentBalance === 0 || isActionInProgress}
              startContent={<TrashIcon className="w-4 h-4" />}
              variant="flat"
              onPress={handleClearBalanceClick}
            >
              Clear Balance
            </Button>
            <div>
              <Button
                className="mr-2"
                color="danger"
                isDisabled={isActionInProgress}
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={isActionInProgress}
                startContent={isLoading ? <Spinner size="sm" /> : null}
                onPress={handleConfirmBalanceUpdate}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isDismissable={false}
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Clear Balance</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to clear the balance for {memberName}?</p>
            <p>Current balance: {currentBalance.toLocaleString()} FCFA</p>
            <p>This action cannot be undone.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              isDisabled={isClearingBalance}
              variant="light"
              onPress={() => setIsClearConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isClearingBalance}
              onPress={handleConfirmClear}
            >
              Clear Balance
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
