"use client";
import { LoggedInUser } from "@/store/user";
import { useAtomValue } from "jotai";
export default function Welcome(): React.ReactElement {
  const user = useAtomValue(LoggedInUser);
  console.log(user);
  return <div>Name: {user.full_name}</div>;
}
