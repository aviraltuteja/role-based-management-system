"use client";
import { useAtomValue } from "jotai";
import { LoggedInUser } from "@/store/user";
export default function Dashboard(): React.ReactElement {
  const user = useAtomValue(LoggedInUser);
  return (
    <div className="bg-white text-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      {user ? (
        <ul className="list-disc pl-5">
          {Object.entries(user).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}
            </li>
          ))}
        </ul>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
}
