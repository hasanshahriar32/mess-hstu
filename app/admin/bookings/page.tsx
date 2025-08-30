"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AdminBookingsPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/owner/login?redirect_back=/admin/bookings";
      return;
    }
    try {
      const parsed = JSON.parse(userData);
      if (parsed.role !== "owner" && parsed.role !== "admin") {
        window.location.href = "/owner/login?redirect_back=/admin/bookings";
        return;
      }
      setUser(parsed);
    } catch {
      window.location.href = "/owner/login?redirect_back=/admin/bookings";
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/bookings/history?user_id=all`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBookings(data.data);
        else setError(data.error || "Failed to fetch bookings");
      })
      .catch(() => setError("Failed to fetch bookings"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancel = async (booking: any) => {
    setCancelLoading(booking.id);
    setCancelError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to cancel booking");
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "cancelled" } : b));
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center mb-6">
          <Link href="/admin/dashboard">
            <Button variant="secondary" size="sm" className="mr-3">
              <ArrowLeft className="w-4 h-4 mr-2" /> Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">All Bookings</h1>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {cancelError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{cancelError}</p>
          </div>
        )}
        {bookings.length === 0 ? (
          <div className="text-slate-600 text-center py-12">No bookings found.</div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <Card key={b.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {b.mess_name} <span className="text-xs text-slate-500 ml-2">({b.category})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="text-slate-700 font-medium">Room: {b.room_type}</div>
                      <div className="text-slate-600 text-sm">Status: <span className="font-semibold capitalize">{b.status}</span></div>
                      <div className="text-slate-600 text-sm">User: {b.user_id}</div>
                      <div className="text-slate-600 text-sm">Location: {b.address}</div>
                      <div className="text-slate-600 text-sm">Date: {new Date(b.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <div className="text-slate-800 font-bold">৳{b.amount || "-"}</div>
                      <div className="text-xs text-slate-500">{b.transaction_status || "-"}</div>
                      {b.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={cancelLoading === b.id}
                          onClick={() => handleCancel(b)}
                        >
                          {cancelLoading === b.id ? "Cancelling..." : "Cancel Booking"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
