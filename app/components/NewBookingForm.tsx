import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabaseClient";

import { CustomCheckbox } from "./CustomCheckbox";

const SERVICES = [
  { name: "Couches", value: "couches" },
  { name: "Carpets", value: "carpets" },
  { name: "Car interior", value: "car_interior" },
  { name: "Mattress", value: "mattress" },
] as const;

interface Location {
  id: string;
  name: string;
}

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

export function NewBookingForm({
  onClose,
  onBookingCreated,
  initialData,
  isEditing = false,
}: NewBookingFormProps) {
  const [formData, setFormData] = useState({
    services: initialData?.services || ([] as string[]),
    location: initialData?.location || "",
    address: initialData?.address || "",
    phone: initialData?.client_phone || "",
    price: initialData?.price?.toString() || "",
    plannedFor: initialData?.planned_at
      ? new Date(initialData.planned_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    status: initialData?.status || "scheduled",
    isPriority: initialData?.priority || false, // This line ensures the priority is prefilled
    moreInfo: initialData?.more_info || "",
  });

  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("locations")
      .select("id, name")
      .order("name");

    if (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } else {
      setLocations(data || []);
    }
  };

  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      if (field === "phone") {
        // Limit phone number to 9 digits
        value = (value as string).slice(0, 9).replace(/\D/g, "");
      }
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const toggleService = useCallback((service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newInvalidFields = new Set<string>();

    if (!formData.services.length) newInvalidFields.add("services");
    if (!formData.location) newInvalidFields.add("location");
    if (!formData.phone) newInvalidFields.add("phone");
    if (!formData.price) newInvalidFields.add("price");
    if (!formData.plannedFor) newInvalidFields.add("plannedFor");

    // Remove address from validation as it's not mandatory
    // if (!formData.address) newInvalidFields.add('address');

    setInvalidFields(newInvalidFields);

    if (newInvalidFields.size > 0) {
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
      state: initialData?.state || "pending", // Preserve existing state or use 'pending' for new bookings
    };

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select();

      if (error) {
        console.error("Error creating booking:", error);
        toast.error("Failed to create booking");
      } else {
        console.log("Booking created:", data);
        toast.success("Booking created successfully");
        onBookingCreated(data[0]);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking");
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <div>
        <label className="block text-small font-medium text-foreground pb-1.5">
          Cleaning service
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((service) => (
            <CustomCheckbox
              key={service.value}
              className={`transition-colors ${formData.services.includes(service.value) ? "bg-blue-500 text-white border-blue-500" : ""}`}
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
          isRequired
          isInvalid={invalidFields.has("location")}
          label="Location"
          placeholder="Select a location"
          onSelectionChange={(value) =>
            handleInputChange("location", value as string)
          }
        >
          {locations.map((location) => (
            <AutocompleteItem key={location.id} value={location.id}>
              {location.name}
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <Input
          label="Exact address"
          placeholder="Enter address"
          value={formData.address}
          onValueChange={(value) => handleInputChange("address", value)}
          // Remove isInvalid and isRequired props
        />
        <Input
          isRequired
          isInvalid={invalidFields.has("phone")}
          label="Phone"
          maxLength={9}
          placeholder="699 88 77 66"
          type="tel"
          value={formData.phone}
          onValueChange={(value) => handleInputChange("phone", value)}
        />
        <Input
          isRequired
          isInvalid={invalidFields.has("price")}
          label="Price"
          placeholder="20 000"
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">FCFA</span>
            </div>
          }
          type="number"
          value={formData.price}
          onValueChange={(value) => handleInputChange("price", value)}
        />
        <Input
          isRequired
          isInvalid={invalidFields.has("plannedFor")}
          label="Planned for"
          placeholder="Select date and time"
          type="datetime-local"
          value={formData.plannedFor}
          onValueChange={(value) => handleInputChange("plannedFor", value)}
        />
        <Select
          isRequired
          label="Status"
          placeholder="Select status"
          selectedKeys={[formData.status]}
          onChange={(e) => handleInputChange("status", e.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <Textarea
        className="w-full"
        label="More info"
        placeholder="Enter additional details about the booking"
        value={formData.moreInfo}
        onValueChange={(value) => handleInputChange("moreInfo", value)}
      />
      <div className="flex justify-between items-center">
        <Switch
          isSelected={formData.isPriority}
          onValueChange={(value) => handleInputChange("isPriority", value)}
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
