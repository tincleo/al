import React, { useState, useCallback } from "react";
import { Button, Autocomplete, AutocompleteItem, Input, Select, SelectItem, Switch, Textarea } from "@nextui-org/react";
import { CustomCheckbox } from './CustomCheckbox';
import { supabase } from "@/lib/supabaseClient";
import toast from 'react-hot-toast';

const SERVICES = [
  { name: "Couches", value: "couches" },
  { name: "Carpets", value: "carpets" },
  { name: "Car interior", value: "car_interior" },
  { name: "Mattress", value: "mattress" },
] as const;

const LOCATIONS = [
  { label: "Bastos", value: "Bastos" },
  { label: "Mvan", value: "Mvan" },
  { label: "Nsimeyong", value: "Nsimeyong" },
  { label: "Biyem-Assi", value: "Biyem-Assi" },
  { label: "Mimboman", value: "Mimboman" },
  { label: "Ngousso", value: "Ngousso" },
  { label: "Emana", value: "Emana" },
  { label: "Nkolbisson", value: "Nkolbisson" },
  { label: "Ekounou", value: "Ekounou" },
  { label: "Essos", value: "Essos" },
] as const;

const STATUS_OPTIONS = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Canceled", value: "canceled" },
] as const;

interface NewBookingFormProps {
  onClose: () => void;
  onBookingCreated: (booking: Partial<Booking>) => void;
  initialData?: Booking;
  isEditing?: boolean;
}

export function NewBookingForm({ onClose, onBookingCreated, initialData, isEditing = false }: NewBookingFormProps) {
  const [formData, setFormData] = useState({
    services: initialData?.services || [] as string[],
    location: initialData?.location || "",
    address: initialData?.address || "",
    phone: initialData?.client_phone || "",
    price: initialData?.price?.toString() || "",
    plannedFor: initialData?.planned_at ? new Date(initialData.planned_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    status: initialData?.status || "scheduled",
    isPriority: initialData?.priority || false,  // This line ensures the priority is prefilled
    moreInfo: initialData?.more_info || "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    if (field === 'phone') {
      // Limit phone number to 9 digits
      value = (value as string).slice(0, 9).replace(/\D/g, '');
    }
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
    setError(null);

    // Validate mandatory fields
    if (!formData.services.length || !formData.location || !formData.address || !formData.phone || !formData.price || !formData.plannedFor) {
      setError("Please fill in all required fields.");
      return;
    }

    const bookingData = {
      services: formData.services,
      location: formData.location,
      address: formData.address,
      planned_at: new Date(formData.plannedFor).toISOString(),
      price: parseFloat(formData.price),
      status: formData.status,
      assigned_to: initialData?.assigned_to || [], // Preserve existing assigned team or use empty array
      client_phone: formData.phone,
      priority: formData.isPriority,
      more_info: formData.moreInfo || null,
      state: initialData?.state || 'pending', // Preserve existing state or use 'pending' for new bookings
    };

    onBookingCreated(bookingData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block text-small font-medium text-foreground pb-1.5">
          Cleaning service*
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
          label="Location*"
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
          label="Phone*"
          placeholder="699 88 77 66"
          type="tel"
          isRequired
          value={formData.phone}
          onValueChange={(value) => handleInputChange('phone', value)}
          maxLength={9}
        />
        <Input
          label="Price*"
          placeholder="20 000"
          type="number"
          isRequired
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">FCFA</span>
            </div>
          }
          value={formData.price}
          onValueChange={(value) => handleInputChange('price', value)}
        />
        <Input
          label="Planned for*"
          placeholder="Select date and time"
          type="datetime-local"
          isRequired
          value={formData.plannedFor}
          onValueChange={(value) => handleInputChange('plannedFor', value)}
        />
        <Select
          label="Status*"
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
            {isEditing ? "Update Booking" : "Create Booking"}
          </Button>
        </div>
      </div>
    </form>
  );
}