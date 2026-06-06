"use client";
import "./globals.css";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  }, [router]);

  const isAdmin = pathname?.startsWith("/admin");
  const isDriver = pathname?.startsWith("/driver");
  const isAuth = pathname?.startsWith("/auth");

  const navigation = isAdmin
    ? [
        { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { name: "Trips", href: "/admin/trips", icon: "🚛" },
        { name: "Drivers", href: "/admin/driver", icon: "🚗" },
        { name: "Locations", href: "/admin/location", icon: "📍" }
      ]
    : isDriver
    ? [
        // { name: "Dashboard", href: "/driver/dashboard", icon: "📊" },
        { name: "Trips", href: "/driver/trips", icon: "🚛" },
      ]
    : [];

  const title = isAdmin ? "RouteRadar Admin" : isDriver ? "RouteRadar Driver" : "RouteRadar";

  return (
    <html lang="en">
      <body className="flex flex-col h-screen overflow-hidden">
        <Script 
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`} 
          strategy="afterInteractive" 
        />
        {/* Top Navigation */}
        {!isAuth && (
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-8">
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {title}
                    </h1>
                  </div>
                  <nav className="flex space-x-4 overflow-x-auto">
                    {navigation.map((item) => {
                      const isActive = pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`
                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                            ${
                              isActive
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                            }
                          `}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">{children}</main>
      </body>
    </html>
  );
}
