"use client";

import { useEffect, useState } from "react";
import { Table } from "@/app/components/dashboard/table/table";
import axios from "axios";
import { UserTableRow } from "@/types/user";
import toast from "react-hot-toast";

export default function UserTable() {
  const [users, setUsers] = useState<UserTableRow[]>([]);

  const fetchUsers = async () => {
    const toastId = toast.loading("Loading users...");
    try {
      const res = await axios.get("http://localhost:8000/users");
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        toast.success("Users loaded successfully", { id: toastId });
      } else {
        throw new Error("Unexpected API response");
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users", { id: toastId });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Users Table</h1>
      <Table data={users} />
    </main>
  );
}
