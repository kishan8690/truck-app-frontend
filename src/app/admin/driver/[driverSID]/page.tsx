import AdminDriverDetailClient from "./AdminDriverDetailClient";

export function generateStaticParams() {
  return [{ driverSID: 'default' }];
}

export default function Page() {
  return <AdminDriverDetailClient />;
}
