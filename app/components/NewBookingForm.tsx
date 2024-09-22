import React, { useState } from "react";
import { Button, Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
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

interface NewBookingFormProps {
  onClose: () => void;
}

export function NewBookingForm({ onClose }: NewBookingFormProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [status, setStatus] = useState("scheduled");
  const [isPriority, setIsPriority] = useState(false);
  const [moreInfo, setMoreInfo] = useState("");

  // Set default date and time
  const now = new Date();
  const defaultDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0).toISOString().slice(0, 16);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div>
        <label className="block text-small font-medium text-foreground pb-1.5">
          Cleaning service
        </label>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <CustomCheckbox
              key={service.value}
              isSelected={selectedServices.includes(service.value)}
              onPress={() => {
                setSelectedServices(prev => 
                  prev.includes(service.value)
                    ? prev.filter(s => s !== service.value)
                    : [...prev, service.value]
                )
              }}
            >
              {service.name}
            </CustomCheckbox>
          ))}
        </div>
      </div>
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
          label="Address"
          placeholder="Enter address"
        />
        <Input
          label="Phone"
          placeholder="699 88 77 66"
          type="tel"
          isRequired
        />
        <Input
          label="Price"
          placeholder="20 000"
          type="number"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">FCFA</span>
            </div>
          }
        />
        <Input
          label="Planned for"
          placeholder="Select date and time"
          type="datetime-local"
          defaultValue={defaultDateTime}
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
      </div>
      <Textarea
        label="More info"
        placeholder="Enter additional details about the booking"
        value={moreInfo}
        onValueChange={setMoreInfo}
        className="w-full"
      />
      <div className="flex justify-between items-center">
        <Switch
          isSelected={isPriority}
          onValueChange={setIsPriority}
        >
          Priority booking
        </Switch>
        <div className="flex gap-2">
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Create Booking
          </Button>
        </div>
      </div>
    </form>
  );
}