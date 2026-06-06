import DriverTripDetailClient from "./DriverTripDetailClient";

export function generateStaticParams() {
  return [{ tripSID: 'default' }];
}

export default function Page() {
  return <DriverTripDetailClient />;
}
