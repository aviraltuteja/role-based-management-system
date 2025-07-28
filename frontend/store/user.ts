import { Locations, Roles, User } from "@/types/user";
import { atom } from "jotai";
import Cookies from "js-cookie";
import axios from "axios";

export const LoggedInUser = atom<User>({
  username: "",
  full_name: "",
  role: Roles.USER,
  location: Locations.INDIA,
  team: "",
  disabled: false,
});

export const setLoggedInUser = atom(
  null,
  async (get, set, user: User): Promise<void> => {
    set(LoggedInUser, user);
  }
);

export const logoutUser = atom(null, async (get, set) => {
  console.log("inside logout");
  try {
    const token = Cookies.get("token");
    if (token) {
      await axios.post("http://localhost:8000/logout", null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (err) {
    console.error("Logout error", err);
  } finally {
    Cookies.remove("token");
    set(LoggedInUser, {
      username: "",
      full_name: "",
      role: Roles.USER,
      location: Locations.INDIA,
      team: "",
      disabled: false,
    });
  }
});
