"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";
import { useSetAtom } from "jotai";
import { setLoggedInUser } from "@/store/user";
import { Roles, Locations } from "@/types/user";

export default function DashboardAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setUser = useSetAtom(setLoggedInUser);

  useEffect(() => {
    const validateToken = async () => {
      const token = Cookies.get("token");

      if (!token) {
        toast.error("Session expired");
        router.push("/");
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;

        setUser({
          ...user,
          role: Roles[user.role as keyof typeof Roles],
          location: Locations[user.location as keyof typeof Locations],
        });
      } catch (err) {
        toast.error("Invalid session. Logging out...");
        console.log(err);
        Cookies.remove("token");
        router.push("/");
      }
    };

    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
