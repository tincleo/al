import React, { useState } from "react";
import { Button, CheckboxGroup, Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { CustomCheckbox } from './CustomCheckbox';

const services = [
  { name: "Couches", value: "couches" },
  { name: "Carpets", value: "carpets" },
  { name: "Car interior", value: "car_interior" },
  { name: "Mattress", value: "mattress" },
];

const locations = [
  { label: "New York", value: "ny" },
  { label: "Los Angeles", value: "la" },
  { label: "Chicago", value: "ch" },
  { label: "Houston", value: "ho" },
  // Add more locations as needed
];

const statusOptions = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Canceled", value: "canceled" },
];

const teamMembers = [
  { label: "Arnauld", value: "arnauld" },
  { label: "Prosper", value: "prosper" },
  { label: "Donovan", value: "donovan" },
  { label: "Michel", value: "michel" },
  { label: "Sharon", value: "sharon" },
  { label: "Joseph", value: "joseph" },
];

interface NewBookingFormProps {
  onClose: () => void;
}

export function NewBookingForm({ onClose }: NewBookingFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [status, setStatus] = useState("scheduled");
  const [isPriority, setIsPriority] = useState(false);
  const [moreInfo, setMoreInfo] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <CheckboxGroup
        className="gap-1"
        label="Cleaning service"
        orientation="horizontal"
        value={selectedServices}
        onChange={setSelectedServices}
        isRequired
      >
        {services.map((service) => (
          <CustomCheckbox key={service.value} value={service.value} className="text-sm">
            {service.name}
          </CustomCheckbox>
        ))}
      </CheckboxGroup>
      <div className="grid grid-cols-2 gap-4">
        <Autocomplete
          label="Location"
          placeholder="Select a location"
          isRequired
        >
          {locations.map((location) => (
            <AutocompleteItem key={location.value} value={location.value}>
              {location.label}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <Input
          label="Phone"
          placeholder="Enter phone number"
          type="tel"
          isRequired
        />
        <Input
          label="Price"
          placeholder="Enter price"
          type="number"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">$</span>
            </div>
          }
        />
        <Input
          label="Date and Time"
          placeholder="Select date and time"
          type="datetime-local"
          isRequired
        />
        <Select
          label="Status"
          placeholder="Select status"
          selectedKeys={[status]}
          onChange={(e) => setStatus(e.target.value)}
          isRequired
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        <Switch
          isSelected={isPriority}
          onValueChange={setIsPriority}
        >
          Priority
        </Switch>
      </div>
      <Select
        label="Assigned to"
        placeholder="Select team members"
        selectionMode="multiple"
        selectedKeys={assignedTo}
        onSelectionChange={(keys) => setAssignedTo(Array.from(keys) as string[])}
        className="w-full"
      >
        {teamMembers.map((member) => (
          <SelectItem key={member.value} value={member.value}>
            {member.label}
          </SelectItem>
        ))}
      </Select>
      <Textarea
        label="More info"
        placeholder="Enter additional details about the booking"
        value={moreInfo}
        onValueChange={setMoreInfo}
        className="w-full"
      />
      <div className="flex justify-end gap-2">
        <Button color="danger" variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="primary" type="submit">
          Create Booking
        </Button>
      </div>
    </form>
  );
}