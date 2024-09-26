"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, CardHeader, Divider, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Switch, Textarea, Select, SelectItem } from "@nextui-org/react";
import { PlusIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { supabase } from "@/lib/supabaseClient";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const SERVICES = ["Couch", "Chair", "Carpet", "House", "Car seats"];
const LOCATIONS = ["Bastos", "Mvan", "Nsimeyong", "Biyem-Assi", "Mimboman", "Ngousso", "Emana", "Nkolbisson", "Ekounou", "Essos"];
const ROLES = ["Admin", "Manager", "Technician", "Marketing"];
const STATUSES = ["Follow-up", "Scheduled", "Confirmed", "Completed", "Canceled"];

type Location = {
  id: string;
  name: string;
  neighboring: string[];
  follow_up: number;
  bookings: number;
  completed: number;
};

export default function Settings() {
  const [services, setServices] = useState(SERVICES.map(service => ({ name: service, enabled: true })));
  const [locations, setLocations] = useState<Location[]>([]);
  const [roles, setRoles] = useState(ROLES);
  const [statuses, setStatuses] = useState(STATUSES);

  const [newService, setNewService] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newLocationNeighboring, setNewLocationNeighboring] = useState<string[]>([]);

  const [serviceError, setServiceError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [statusError, setStatusError] = useState(false);

  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [isNewLocationModalOpen, setIsNewLocationModalOpen] = useState(false);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [isNewStatusModalOpen, setIsNewStatusModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<{ column: keyof Location, direction: "ascending" | "descending" }>({ column: "name", direction: "ascending" });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.neighboring.some(neighbor => neighbor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [locations, searchQuery]);

  const sortedLocations = useMemo(() => {
    return [...filteredLocations].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [filteredLocations, sortDescriptor]);

  const handleAddService = () => {
    if (newService.trim()) {
      setServices([...services, { name: newService, enabled: true }]);
      setNewService("");
      setIsNewServiceModalOpen(false);
      setServiceError(false);
    } else {
      setServiceError(true);
    }
  };

  const handleAddLocation = async () => {
    if (newLocation.trim()) {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('locations')
          .insert({
            name: newLocation,
            neighboring: newLocationNeighboring,
            follow_up: 0,
            bookings: 0,
            completed: 0
          })
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          setLocations([...locations, data[0] as Location]);
          setNewLocation("");
          setNewLocationNeighboring([]);
          setIsNewLocationModalOpen(false);
          setLocationError(false);
          toast.success('Location added successfully!');
          await fetchLocations(); // Refresh the locations data
        } else {
          throw new Error('No data returned from insert operation');
        }
      } catch (error) {
        console.error('Error adding location:', error);
        if (error instanceof Error) {
          toast.error(`Failed to add location: ${error.message}`);
        } else {
          toast.error('Failed to add location. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setLocationError(true);
    }
  };

  const handleAddRole = () => {
    if (newRole.trim()) {
      setRoles([...roles, newRole]);
      setNewRole("");
      setIsNewRoleModalOpen(false);
      setRoleError(false);
    } else {
      setRoleError(true);
    }
  };

  const handleAddStatus = () => {
    if (newStatus.trim()) {
      setStatuses([...statuses, newStatus]);
      setNewStatus("");
      setIsNewStatusModalOpen(false);
      setStatusError(false);
    } else {
      setStatusError(true);
    }
  };

  const handleToggleService = (index: number) => {
    const updatedServices = [...services];
    updatedServices[index].enabled = !updatedServices[index].enabled;
    setServices(updatedServices);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsEditLocationModalOpen(true);
  };

  const getLocationNameById = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : '';
  };

  const handleSaveLocation = async () => {
    if (editingLocation) {
      try {
        const { error } = await supabase
          .from('locations')
          .update({
            name: editingLocation.name,
            neighboring: editingLocation.neighboring
          })
          .eq('id', editingLocation.id);

        if (error) throw error;

        setIsEditLocationModalOpen(false);
        await fetchLocations(); // Refresh the locations data
        toast.success('Location updated successfully!');
      } catch (error) {
        console.error('Error updating location:', error);
        toast.error('Failed to update location. Please try again.');
      }
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    onEditModalOpen();
  };

  const handleDelete = async (item: Location, type: string) => {
    setDeletingItem({ ...item, type });
    onDeleteModalOpen();
  };

  const handleDeleteConfirm = async () => {
    if (deletingItem) {
      try {
        const { error } = await supabase
          .from('locations')
          .delete()
          .eq('id', deletingItem.id);

        if (error) throw error;

        onDeleteModalClose();
        await fetchLocations(); // Refresh the locations data
        toast.success('Location deleted successfully!');
      } catch (error) {
        console.error('Error deleting location:', error);
        toast.error('Failed to delete location. Please try again.');
      }
    }
  };

  const fetchServices = async () => {
    // Implement this function to fetch services from Supabase
  };

  const fetchRoles = async () => {
    // Implement this function to fetch roles from Supabase
  };

  const fetchStatuses = async () => {
    // Implement this function to fetch statuses from Supabase
  };

  return (
    <section className="space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="font-semibold text-xl lg:text-2xl">Settings</h1>
      <Tabs variant="bordered">
        <Tab title="Locations">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-sm font-medium">Manage Locations</h2>
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                />
                <Button color="primary" size="sm" onPress={() => setIsNewLocationModalOpen(true)}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  New Location
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {isLoading ? (
                <div>Loading locations...</div>
              ) : (
                <Table
                  aria-label="Locations"
                  sortDescriptor={sortDescriptor}
                  onSortChange={(descriptor) => setSortDescriptor(descriptor as typeof sortDescriptor)}
                >
                  <TableHeader>
                    <TableColumn key="name" allowsSorting>Location</TableColumn>
                    <TableColumn key="neighboring" allowsSorting>Neighboring</TableColumn>
                    <TableColumn key="follow_up" allowsSorting>Follow-up</TableColumn>
                    <TableColumn key="bookings" allowsSorting>Bookings</TableColumn>
                    <TableColumn key="completed" allowsSorting>Completed</TableColumn>
                    <TableColumn>Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {sortedLocations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.neighboring.map(getLocationNameById).join(', ')}</TableCell>
                        <TableCell>{location.follow_up}</TableCell>
                        <TableCell>{location.bookings}</TableCell>
                        <TableCell>{location.completed}</TableCell>
                        <TableCell>
                          <Button isIconOnly size="sm" variant="light" onPress={() => handleEditLocation(location)}>
                            <PencilIcon className="w-5 h-5" />
                          </Button>
                          <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(location, 'locations')}>
                            <TrashIcon className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
        <Tab title="Services">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-sm font-medium">Manage Cleaning Services</h2>
              <Button color="primary" size="sm" onPress={() => setIsNewServiceModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                New Service
              </Button>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table aria-label="Cleaning Services">
                <TableHeader>
                  <TableColumn>Service</TableColumn>
                  <TableColumn>Enabled</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>
                        <Switch
                          isSelected={service.enabled}
                          onValueChange={() => handleToggleService(index)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(service, 'services')}>
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(service, 'services')}>
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="Roles">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-sm font-medium">Manage Team Roles</h2>
              <Button color="primary" size="sm" onPress={() => setIsNewRoleModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                New Role
              </Button>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table aria-label="Team Roles">
                <TableHeader>
                  <TableColumn>Role</TableColumn>
                  <TableColumn>Permissions</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={index}>
                      <TableCell>{role}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Checkbox>View</Checkbox>
                          <Checkbox>Edit</Checkbox>
                          <Checkbox>Delete</Checkbox>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button isIconOnly size="sm" variant="light">
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" color="danger">
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="Bookings">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-sm font-medium">Manage Booking Statuses</h2>
              <Button color="primary" size="sm" onPress={() => setIsNewStatusModalOpen(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                New Status
              </Button>
            </CardHeader>
            <Divider />
            <CardBody>
              <Table aria-label="Booking Statuses">
                <TableHeader>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {statuses.map((status, index) => (
                    <TableRow key={index}>
                      <TableCell>{status}</TableCell>
                      <TableCell>
                        <Button isIconOnly size="sm" variant="light">
                          <PencilIcon className="w-5 h-5" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light" color="danger">
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </Tab>
        <Tab title="Mobile App">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-medium">Mobile App Settings</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex flex-col gap-4">
                <Input
                  label="API Key"
                  placeholder="Enter API key"
                />
                <Input
                  label="App Version"
                  placeholder="Enter app version"
                />
                <Textarea
                  label="Release Notes"
                  placeholder="Enter release notes"
                />
                <Switch
                  isSelected={true}
                  onValueChange={() => {}}
                >
                  Enable Push Notifications
                </Switch>
                <Switch
                  isSelected={false}
                  onValueChange={() => {}}
                >
                  Enable Dark Mode
                </Switch>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* New Service Modal */}
      <Modal 
        isOpen={isNewServiceModalOpen} 
        onClose={() => {
          setIsNewServiceModalOpen(false);
          setServiceError(false);
        }}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add New Service</ModalHeader>
          <ModalBody>
            <Input
              label="Service Name"
              placeholder="Enter new service"
              value={newService}
              onValueChange={(value) => {
                setNewService(value);
                setServiceError(false);
              }}
              color={serviceError ? "danger" : "default"}
              errorMessage={serviceError ? "Service name cannot be empty" : ""}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => {
              setIsNewServiceModalOpen(false);
              setServiceError(false);
            }}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddService}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Location Modal */}
      <Modal 
        isOpen={isNewLocationModalOpen} 
        onClose={() => {
          setIsNewLocationModalOpen(false);
          setLocationError(false);
          setNewLocation("");
          setNewLocationNeighboring([]);
        }}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add New Location</ModalHeader>
          <ModalBody>
            <Input
              label="Location Name"
              placeholder="Enter new location"
              value={newLocation}
              onValueChange={(value) => {
                setNewLocation(value);
                setLocationError(false);
              }}
              color={locationError ? "danger" : "default"}
              errorMessage={locationError ? "Location name cannot be empty" : ""}
            />
            <Select
              label="Neighboring Locations"
              placeholder="Select neighboring locations"
              selectionMode="multiple"
              selectedKeys={new Set(newLocationNeighboring)}
              onSelectionChange={(keys) => setNewLocationNeighboring(Array.from(keys) as string[])}
              isSearchable
            >
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => {
              setIsNewLocationModalOpen(false);
              setLocationError(false);
              setNewLocation("");
              setNewLocationNeighboring([]);
            }}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddLocation}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Role Modal */}
      <Modal 
        isOpen={isNewRoleModalOpen} 
        onClose={() => {
          setIsNewRoleModalOpen(false);
          setRoleError(false);
        }}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add New Role</ModalHeader>
          <ModalBody>
            <Input
              label="Role Name"
              placeholder="Enter new role"
              value={newRole}
              onValueChange={(value) => {
                setNewRole(value);
                setRoleError(false);
              }}
              color={roleError ? "danger" : "default"}
              errorMessage={roleError ? "Role name cannot be empty" : ""}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => {
              setIsNewRoleModalOpen(false);
              setRoleError(false);
            }}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddRole}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Status Modal */}
      <Modal 
        isOpen={isNewStatusModalOpen} 
        onClose={() => {
          setIsNewStatusModalOpen(false);
          setStatusError(false);
        }}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Add New Status</ModalHeader>
          <ModalBody>
            <Input
              label="Status Name"
              placeholder="Enter new status"
              value={newStatus}
              onValueChange={(value) => {
                setNewStatus(value);
                setStatusError(false);
              }}
              color={statusError ? "danger" : "default"}
              errorMessage={statusError ? "Status name cannot be empty" : ""}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => {
              setIsNewStatusModalOpen(false);
              setStatusError(false);
            }}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddStatus}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Location Modal */}
      <Modal 
        isOpen={isEditLocationModalOpen} 
        onClose={() => setIsEditLocationModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Edit Location</ModalHeader>
          <ModalBody>
            {editingLocation && (
              <div className="flex flex-col gap-4">
                <Input
                  label="Location Name"
                  placeholder="Enter location name"
                  value={editingLocation.name}
                  onValueChange={(value) => setEditingLocation({ ...editingLocation, name: value })}
                />
                <Select
                  label="Neighboring Locations"
                  placeholder="Select neighboring locations"
                  selectionMode="multiple"
                  selectedKeys={new Set(editingLocation.neighboring)}
                  onSelectionChange={(keys) => setEditingLocation({ ...editingLocation, neighboring: Array.from(keys) as string[] })}
                  isSearchable
                >
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={() => setIsEditLocationModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSaveLocation}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="md">
        <ModalContent>
          <ModalHeader>Edit {editingItem?.type.slice(0, -1)}</ModalHeader>
          <ModalBody>
            {editingItem && (
              <Input
                label={`${editingItem.type.slice(0, -1)} Name`}
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onEditModalClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => handleEditSave(editingItem)}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} size="md">
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            <p className="text-danger">Warning: This action cannot be undone.</p>
            <p>Are you sure you want to delete this {deletingItem?.type.slice(0, -1)}?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteModalClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </section>
  );
}