"use client";

import SidebarDesktop from "./sidebar-desktop";
import {
  Home,
  Presentation,
  Calendar,
  User,
  Target,
  Folder,
} from "lucide-react";
import { SidebarItems } from "@/types";
import { useMediaQuery } from "usehooks-ts";
import { SidebarMobile } from "./sidebar-mobile";
import BarLoader from "react-spinners/BarLoader";

import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, User as UserType } from "firebase/auth";
import { useRouter } from "next/navigation";

const sidebarItems: SidebarItems = {
  links: [
    { label: "Home", href: "/", icon: Home },
    { label: "Boards", href: "/boards", icon: Presentation },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Focus", href: "/focus", icon: Target },
    { label: "Resources", href: "/resources", icon: Folder },
    { label: "Profile", href: "/profile", icon: User },
  ],
};

export default function Sidebar() {
  const isDesktop = useMediaQuery("(min-width: 640px", {
    initializeWithValue: false,
  }); // returns boolean

  const auth = getAuth(app);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userCheck = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setUser(null);
      }
    });
    return () => userCheck();
  }, [auth]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/");
      } else {
        console.log("landing");
        router.push("/landing");
      }
    }
  }, [router, loading, user]);

  if (loading) {
    console.log("im loading");
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h1 className="text-white text-xl font-semibold mb-3">Loading...</h1>
        <BarLoader color="#90E4C1" />
      </div>
    );
  }

  if (user) {
    if (isDesktop) {
      return <SidebarDesktop sidebarItems={sidebarItems} />;
    } else {
      return <SidebarMobile sidebarItems={sidebarItems} />;
    }
  }

  return null;
}
