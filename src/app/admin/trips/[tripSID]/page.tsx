import AdminTripDetailClient from "./AdminTripDetailClient";

export function generateStaticParams() {
  return [{ tripSID: 'default' }];
}

export default function Page() {
  return <AdminTripDetailClient />;
}
