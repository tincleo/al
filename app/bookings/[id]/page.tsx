"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Radio,
  RadioGroup,
  Badge,
  Select,
  SelectItem,
  Selection,
} from "@nextui-org/react";
import {
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  InformationCircleIcon,
  TrashIcon,
  ShareIcon,
  PencilIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Spinner } from "@nextui-org/react";
import toast, { Toaster } from "react-hot-toast";

import { supabase } from "@/lib/supabaseClient";

import { title } from "../../components/primitives";
import { NewBookingForm } from "../../components/NewBookingForm";

type Booking = {
  id: number;
  created_at: string;
  services: string[];
  location: string;
  location_name?: string;
  address: string;
  planned_at: string;
  price: number;
  status: string;
  assigned_to: { name: string; id: string }[];
  client_phone: string;
  priority: boolean;
  more_info: string | null;
  completed_at: string | null;
  amount_paid: number | null;
  payment_method: string | null;
  created_by: string | null;
  state: string | null;
  images_before: string[] | null;
  images_after: string[] | null;
};

type TeamMember = {
  id: string;
  name: string;
  avatar: string | null;
};

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefAfter = useRef<HTMLInputElement>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<Selection>(
    new Set(),
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
    fetchTeamMembers();
  }, [bookingId]);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Fetch the location name
      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .select("name")
        .eq("id", bookingData.location)
        .single();

      if (locationError) {
        // Replace console.error with a toast notification or other error handling
        toast.error("Error fetching location name");
      }

      const bookingWithLocationName = {
        ...bookingData,
        location_name: locationData?.name || "Unknown Location",
      };

      setBooking(bookingWithLocationName);
      if (bookingWithLocationName.amount_paid)
        setAmountPaid(bookingWithLocationName.amount_paid.toString());
      setSelectedTeamMembers(
        new Set(
          bookingWithLocationName.assigned_to.map(
            (member: { id: string }) => member.id,
          ),
        ),
      );
    } catch (error) {
      // Replace console.error with a toast notification or other error handling
      toast.error("Failed to load booking details");
    }
  }, [bookingId]);

  const fetchTeamMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from("team")
      .select("id, name, avatar");

    if (error) {
      // Replace console.error with a toast notification or other error handling
      toast.error("Error fetching team members");
    } else {
      setTeamMembers(data || []);
    }
  }, []);

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      // Replace console.error with a toast notification
      toast.error("Failed to delete booking. Please try again.");
    } else {
      toast.success("Booking deleted successfully!");
      router.push("/bookings");
    }
  };

  const handleMarkAsCompleted = () => {
    setIsCompleteModalOpen(true);
  };

  const handleConfirmCompletion = async () => {
    const { error } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: completionDate,
        amount_paid: parseFloat(amountPaid),
        payment_method: paymentMethod,
      })
      .eq("id", bookingId);

    if (error) {
      toast.error("Error updating booking:", error);
    } else {
      setIsCompleteModalOpen(false);
      fetchBookingDetails();
    }
  };

  const handleImageUpload = async (files: File[], type: "before" | "after") => {
    const setUploading =
      type === "before" ? setUploadingBefore : setUploadingAfter;

    setUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${booking?.id}/${type}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("alpha")
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from("alpha")
            .getPublicUrl(filePath);

          if (!urlData) {
            throw new Error("Failed to get public URL");
          }

          return urlData.publicUrl;
        }),
      );

      const currentImages =
        (booking?.[`images_${type}` as keyof typeof booking] as string[]) || [];
      const updatedImages = [...currentImages, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          [`images_${type}`]: updatedImages,
        })
        .eq("id", booking?.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh booking details
      fetchBookingDetails();
    } catch (error) {
      // Replace console.error with a toast notification
      toast.error(`Error uploading ${type} images`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (files) {
      handleImageUpload(Array.from(files), "before");
    }
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChangeAfter = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (files) {
      handleImageUpload(Array.from(files), "after");
    }
  };

  const openFilePickerAfter = () => {
    if (fileInputRefAfter.current) {
      fileInputRefAfter.current.click();
    }
  };

  const supabaseLoader = ({
    src,
    width,
    quality,
  }: {
    src: string;
    width: number;
    quality?: number;
  }) => {
    return `https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/${src}?width=${width}&quality=${quality || 75}`;
  };

  const handleDeleteImage = async (
    imageUrl: string,
    type: "before" | "after",
  ) => {
    try {
      const updatedImages =
        booking?.[`images_${type}`]?.filter((img) => img !== imageUrl) || [];

      const { error } = await supabase
        .from("bookings")
        .update({ [`images_${type}`]: updatedImages })
        .eq("id", booking?.id);

      if (error) throw error;

      // Remove the file from storage
      const filePath = imageUrl.replace(
        "https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/alpha/",
        "",
      );
      const { error: deleteError } = await supabase.storage
        .from("alpha")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Refresh booking details
      fetchBookingDetails();
    } catch (error) {
      // Replace console.error with a toast notification
      toast.error(`Error deleting image`);
    }
  };

  const handleTeamMemberSelection = async (keys: Selection) => {
    const selectedIds = Array.from(keys) as string[];

    setSelectedTeamMembers(new Set(selectedIds));

    const selectedMembers = teamMembers.filter((member) =>
      selectedIds.includes(member.id),
    );

    const { error } = await supabase
      .from("bookings")
      .update({
        assigned_to: selectedMembers.map(({ id, name }) => ({ id, name })),
      })
      .eq("id", bookingId);

    if (error) {
      // Replace console.error with a toast notification
      toast.error("Error updating assigned team");
    } else {
      fetchBookingDetails();
    }
  };

  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return undefined;

    return `https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/alpha/${avatarPath}`;
  };

  const renderTeamMember = (member: TeamMember) => (
    <div className="flex items-center gap-2">
      <Avatar name={member.name} size="sm" src={getAvatarUrl(member.avatar)} />
      <span>{member.name}</span>
    </div>
  );

  const handleEditSave = async (updatedBooking: Partial<Booking>) => {
    const { error } = await supabase
      .from("bookings")
      .update(updatedBooking)
      .eq("id", bookingId);

    if (error) {
      toast.error("Error updating booking:", error);
    } else {
      setIsEditModalOpen(false);
      fetchBookingDetails();
      toast.success("Booking updated successfully!");
    }
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Badge
            color="danger"
            content="Priority"
            isInvisible={!booking.priority}
            placement="top-right"
          >
            <h1 className={title({ size: "md" })}>Booking Details</h1>
          </Badge>
          <Chip
            color={
              booking.status === "scheduled"
                ? "primary"
                : booking.status === "completed"
                  ? "success"
                  : "danger"
            }
            size="lg"
          >
            {booking.status.toUpperCase()}
          </Chip>
        </div>
        <div className="flex space-x-2">
          <Button
            color="primary"
            startContent={<ShareIcon className="w-4 h-4" />}
            variant="bordered"
          >
            Share
          </Button>
          <Button
            color="primary"
            startContent={<PencilIcon className="w-4 h-4" />}
            variant="bordered"
            onPress={() => setIsEditModalOpen(true)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            startContent={<TrashIcon className="w-4 h-4" />}
            variant="bordered"
            onPress={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              {booking.services.map((service, index) => (
                <Chip key={index} color="primary" variant="flat">
                  {service}
                </Chip>
              ))}
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Planned for:</span>
                <span>{new Date(booking.planned_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Location:</span>
                <span>{booking.location_name || "Unknown Location"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Address:</span>
                <span>{booking.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Price:</span>
                <span>${booking.price}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold">Client phone:</span>
                <Dropdown>
                  <DropdownTrigger>
                    <Button size="md" variant="bordered">
                      {booking.client_phone}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Phone Actions">
                    <DropdownItem
                      key="call"
                      onPress={() =>
                        (window.location.href = `tel:${booking.client_phone}`)
                      }
                    >
                      Call
                    </DropdownItem>
                    <DropdownItem
                      key="whatsapp"
                      onPress={() =>
                        window.open(
                          `https://wa.me/${booking.client_phone.replace(/\D/g, "")}`,
                          "_blank",
                        )
                      }
                    >
                      WhatsApp
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <h2 className={title({ size: "sm" })}>Additional Information</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Notes:</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {booking.more_info || "No additional information"}
                </p>
              </div>
              <div>
                <span className="font-semibold">Assigned Team:</span>
                <Select
                  className="max-w-xs mt-2"
                  items={teamMembers}
                  placeholder="Select team members"
                  selectedKeys={selectedTeamMembers}
                  selectionMode="multiple"
                  onSelectionChange={handleTeamMemberSelection}
                >
                  {(member) => (
                    <SelectItem key={member.id} textValue={member.name}>
                      {renderTeamMember(member)}
                    </SelectItem>
                  )}
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {booking.assigned_to.map((member) => {
                    const teamMember = teamMembers.find(
                      (tm) => tm.id === member.id,
                    );

                    return (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/team/${member.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            router.push(`/team/${member.id}`);
                          }
                        }}
                      >
                        <Avatar
                          name={member.name}
                          size="sm"
                          src={getAvatarUrl(teamMember?.avatar ?? null)}
                        />
                        <span className="text-sm">{member.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="font-semibold">State:</span>
                <span>{booking.state || "Not specified"}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <div className="h-full">
            <CardHeader className="flex justify-between items-center">
              <h2 className={title({ size: "sm" })}>Images Before</h2>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={openFilePicker}
              >
                <PlusIcon className="w-6 h-6" />
              </Button>
            </CardHeader>
            <Divider />
            <CardBody>
              <input
                ref={fileInputRef}
                multiple
                accept="image/*"
                style={{ display: "none" }}
                type="file"
                onChange={handleFileInputChange}
              />
              {uploadingBefore ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner color="primary" label="Uploading..." />
                </div>
              ) : booking?.images_before && booking.images_before.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-1">
                  {booking.images_before.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        alt={`Before ${index + 1}`}
                        className="object-cover rounded cursor-pointer w-full h-full"
                        height={150}
                        loader={supabaseLoader}
                        src={image.replace(
                          "https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/",
                          "",
                        )}
                        width={150}
                        onClick={() => handleImageClick(image)}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image, "before");
                        }}
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 text-gray-400">
                  <p>No images uploaded yet</p>
                </div>
              )}
            </CardBody>
          </div>
        </Card>

        <Card className="p-4">
          <div className="h-full">
            <CardHeader className="flex justify-between items-center">
              <h2 className={title({ size: "sm" })}>Images After</h2>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={openFilePickerAfter}
              >
                <PlusIcon className="w-6 h-6" />
              </Button>
            </CardHeader>
            <Divider />
            <CardBody>
              <input
                ref={fileInputRefAfter}
                multiple
                accept="image/*"
                style={{ display: "none" }}
                type="file"
                onChange={handleFileInputChangeAfter}
              />
              {uploadingAfter ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner color="primary" label="Uploading..." />
                </div>
              ) : booking?.images_after && booking.images_after.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-1">
                  {booking.images_after.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        alt={`After ${index + 1}`}
                        className="object-cover rounded cursor-pointer w-full h-full"
                        height={150}
                        loader={supabaseLoader}
                        src={image.replace(
                          "https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/",
                          "",
                        )}
                        width={150}
                        onClick={() => handleImageClick(image)}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image, "after");
                        }}
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 text-gray-400">
                  <p>No images uploaded yet</p>
                </div>
              )}
            </CardBody>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created on: {new Date(booking.created_at).toLocaleDateString()} by{" "}
          {booking.created_by || "Unknown"}
        </span>
        {booking.status !== "completed" && (
          <Button color="primary" size="lg" onPress={handleMarkAsCompleted}>
            Mark as Completed
          </Button>
        )}
      </div>

      <Modal
        isDismissable={false}
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Mark Booking as Completed</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Job completed on:"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
              <Input
                label="Amount paid:"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              <RadioGroup
                label="Paid via:"
                orientation="horizontal"
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <Radio value="cash">Cash</Radio>
                <Radio value="mobile_money">Mobile Money</Radio>
              </RadioGroup>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsCompleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleConfirmCompletion}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image enlargement modal */}
      <Modal
        isOpen={!!selectedImage}
        size="5xl"
        onClose={() => setSelectedImage(null)}
      >
        <ModalContent>
          <ModalBody>
            {selectedImage && (
              <Image
                alt="Enlarged image"
                className="object-contain w-full h-full"
                height={1000}
                loader={supabaseLoader}
                src={selectedImage.replace(
                  "https://wobsffraovwwjbxcrtdi.supabase.co/storage/v1/object/public/",
                  "",
                )}
                width={1000}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        backdrop="blur"
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirm Deletion
          </ModalHeader>
          <ModalBody>
            <p className="text-danger">
              Warning: This action cannot be undone.
            </p>
            <p>Are you sure you want to delete this booking?</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal
        isOpen={isEditModalOpen}
        size="3xl"
        onClose={() => setIsEditModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Edit Booking
          </ModalHeader>
          <ModalBody>
            {booking && (
              <NewBookingForm
                initialData={booking}
                isEditing={true}
                onBookingCreated={handleEditSave}
                onClose={() => setIsEditModalOpen(false)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
