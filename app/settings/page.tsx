"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Divider, Input, Button, Select, SelectItem, Switch, Textarea, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tabs, Tab, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { title } from "@/components/primitives";
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const SERVICES = ["Couch", "Chair", "Carpet", "House", "Car seats"];
const LOCATIONS = ["Bastos", "Mvan", "Nsimeyong", "Biyem-Assi", "Mimboman", "Ngousso", "Emana", "Nkolbisson", "Ekounou", "Essos"];
const ROLES = ["Admin", "Manager", "Technician", "Marketing"];
const STATUSES = ["Follow-up", "Scheduled", "Confirmed", "Completed", "Canceled"];

export default function Settings() {
  const [services, setServices] = useState(SERVICES.map(service => ({ name: service, enabled: true })));
  const [locations, setLocations] = useState(LOCATIONS.map(location => ({ name: location, neighboring: [] as string[] })));
  const [roles, setRoles] = useState(ROLES);
  const [statuses, setStatuses] = useState(STATUSES);

  const [newService, setNewService] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<{ name: string, neighboring: string[] } | null>(null);
  const [editingLocationIndex, setEditingLocationIndex] = useState<number | null>(null);

  const handleAddService = () => {
    if (newService) {
      setServices([...services, { name: newService, enabled: true }]);
      setNewService("");
    }
  };

  const handleAddLocation = () => {
    if (newLocation) {
      setLocations([...locations, { name: newLocation, neighboring: [] }]);
      setNewLocation("");
    }
  };

  const handleAddRole = () => {
    if (newRole) {
      setRoles([...roles, newRole]);
      setNewRole("");
    }
  };

  const handleAddStatus = () => {
    if (newStatus) {
      setStatuses([...statuses, newStatus]);
      setNewStatus("");
    }
  };

  const handleToggleService = (index: number) => {
    const updatedServices = [...services];
    updatedServices[index].enabled = !updatedServices[index].enabled;
    setServices(updatedServices);
  };

  const handleEditLocation = (index: number) => {
    setEditingLocation(locations[index]);
    setEditingLocationIndex(index);
    setIsEditLocationModalOpen(true);
  };

  const handleSaveLocation = () => {
    if (editingLocationIndex !== null && editingLocation) {
      const updatedLocations = [...locations];
      updatedLocations[editingLocationIndex] = editingLocation;
      setLocations(updatedLocations);
      setIsEditLocationModalOpen(false);
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="font-semibold text-xl lg:text-2xl">Settings</h1>
      <Tabs variant="bordered">
        <Tab title="Services">
          <Card>
            <CardHeader>
              <h2 className={title({ size: 'sm' })}>Manage Cleaning Services</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex gap-4">
                <Input
                  label="New Service"
                  placeholder="Enter new service"
                  value={newService}
                  onValueChange={setNewService}
                />
                <Button color="primary" onPress={handleAddService}>
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
              <Table aria-label="Cleaning Services" className="mt-4">
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
        <Tab title="Locations">
          <Card>
            <CardHeader>
              <h2 className={title({ size: 'sm' })}>Manage Locations</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex gap-4">
                <Input
                  label="New Location"
                  placeholder="Enter new location"
                  value={newLocation}
                  onValueChange={setNewLocation}
                />
                <Button color="primary" onPress={handleAddLocation}>
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
              <Table aria-label="Locations" className="mt-4">
                <TableHeader>
                  <TableColumn>Location</TableColumn>
                  <TableColumn>Neighboring</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {locations.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.neighboring.join(', ')}</TableCell>
                      <TableCell>
                        <Button isIconOnly size="sm" variant="light" onPress={() => handleEditLocation(index)}>
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
        <Tab title="Roles">
          <Card>
            <CardHeader>
              <h2 className={title({ size: 'sm' })}>Manage Team Roles</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex gap-4">
                <Input
                  label="New Role"
                  placeholder="Enter new role"
                  value={newRole}
                  onValueChange={setNewRole}
                />
                <Button color="primary" onPress={handleAddRole}>
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
              <Table aria-label="Team Roles" className="mt-4">
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
            <CardHeader>
              <h2 className="text-sm font-medium">Manage Booking Statuses</h2>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="flex gap-4">
                <Input
                  label="New Status"
                  placeholder="Enter new status"
                  value={newStatus}
                  onValueChange={setNewStatus}
                />
                <Button color="primary" onPress={handleAddStatus}>
                  <PlusIcon className="w-5 h-5" />
                </Button>
              </div>
              <Table aria-label="Booking Statuses" className="mt-4">
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
              <h2 className={title({ size: 'sm' })}>Mobile App Settings</h2>
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
                  selectedKeys={editingLocation.neighboring}
                  onSelectionChange={(keys) => setEditingLocation({ ...editingLocation, neighboring: Array.from(keys) as string[] })}
                >
                  {locations.map((location, index) => (
                    <SelectItem key={index} value={location.name}>
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
    </section>
  );
}