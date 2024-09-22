import React, { useState, useCallback } from "react";
import { Button, Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { CustomCheckbox } from './CustomCheckbox';
import { supabase } from "@/lib/supabaseClient";

const SERVICES = [
  { name: "Couches", value: "couches" },
  { name: "Carpets", value: "carpets" },
  { name: "Car interior", value: "car_interior" },
  { name: "Mattress", value: "mattress" },
] as const;

const LOCATIONS = [
  { label: "New York", value: "ny" },
  { label: "Los Angeles", value: "la" },
  { label: "Chicago", value: "ch" },
  { label: "Houston", value: "ho" },
] as const;

const STATUS_OPTIONS = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Canceled", value: "canceled" },
] as const;

interface NewBookingFormProps {
  onClose: () => void;
  onBookingCreated: () => void;
}

export function NewBookingForm({ onClose, onBookingCreated }: NewBookingFormProps) {
  const [formData, setFormData] = useState({
    services: [] as string[],
    location: "",
    address: "",
    phone: "",
    price: "",
    plannedFor: new Date().toISOString().slice(0, 16),
    status: "scheduled",
    isPriority: false,
    moreInfo: "",
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleService = useCallback((service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            services: formData.services,
            location: formData.location,
            address: formData.address,
            client_phone: formData.phone,
            price: parseFloat(formData.price),
            planned_at: formData.plannedFor,
            status: formData.status,
            priority: formData.isPriority,
            more_info: formData.moreInfo,
          }
        ]);

      if (error) throw error;
      
      console.log("Booking created:", data);
      onBookingCreated();
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div>
        <label className="block text-small font-medium text-foreground pb-1.5">
          Cleaning service
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((service) => (
            <CustomCheckbox
              key={service.value}
              isSelected={formData.services.includes(service.value)}
              onPress={() => toggleService(service.value)}
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
          onSelectionChange={(value) => handleInputChange('location', value as string)}
        >
          {LOCATIONS.map((location) => (
            <AutocompleteItem key={location.value} value={location.value}>
              {location.label}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <Input
          label="Address"
          placeholder="Enter address"
          value={formData.address}
          onValueChange={(value) => handleInputChange('address', value)}
        />
        <Input
          label="Phone"
          placeholder="699 88 77 66"
          type="tel"
          isRequired
          value={formData.phone}
          onValueChange={(value) => handleInputChange('phone', value)}
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
          value={formData.price}
          onValueChange={(value) => handleInputChange('price', value)}
        />
        <Input
          label="Planned for"
          placeholder="Select date and time"
          type="datetime-local"
          isRequired
          value={formData.plannedFor}
          onValueChange={(value) => handleInputChange('plannedFor', value)}
        />
        <Select
          label="Status"
          placeholder="Select status"
          selectedKeys={[formData.status]}
          onChange={(e) => handleInputChange('status', e.target.value)}
          isRequired
        >
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <Textarea
        label="More info"
        placeholder="Enter additional details about the booking"
        value={formData.moreInfo}
        onValueChange={(value) => handleInputChange('moreInfo', value)}
        className="w-full"
      />
      <div className="flex justify-between items-center">
        <Switch
          isSelected={formData.isPriority}
          onValueChange={(value) => handleInputChange('isPriority', value)}
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