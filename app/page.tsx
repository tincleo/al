import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { title, subtitle } from "../components/primitives";

export default function Home() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className={title({ size: "sm" })}>Dashboard Overview</h2>
      <h3 className={subtitle({ class: "mt-1" })}>Here's a summary of your business</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Total Bookings</p>
              <p className="text-small text-default-500">This month</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">125</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Revenue</p>
              <p className="text-small text-default-500">This month</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">$12,500</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Active Team Members</p>
              <p className="text-small text-default-500">Currently working</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">8</p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
