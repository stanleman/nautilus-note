"use client";

import { SidebarItems } from "@/types";
import SidebarButton from "./sidebar-button";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { LogOut, MoreHorizontal, Power } from "lucide-react";
import { usePathname } from "next/navigation";

import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
}

export default function SidebarDesktop(props: SidebarDesktopProps) {
  const pathname = usePathname();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCheck = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => userCheck();
  }, [auth]);

  const logOutHandler = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Failed to sign in with Google: ", error.message);
      } else {
        console.log("Failed to sign in with Google: An unknown error occurred");
      }
    }
  };

  return (
    <aside className="w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r">
      <div className="h-full px-3 py-4">
        <h3 className="mx-3 text-lg font-semibold text-[#90E4C1]">
          Nautilus Note
        </h3>

        <div className="mt-5">
          <div className="flex flex-col gap-1 w-full">
            {props.sidebarItems.links.map((link, index) => (
              <Link key={index} href={link.href}>
                <SidebarButton
                  variant={pathname === link.href ? "default" : "ghost"}
                  icon={link.icon}
                  className="w-full"
                >
                  {link.label}
                </SidebarButton>
              </Link>
            ))}
          </div>
          <div className="absolute left-0 bottom-3 w-full px-3 pt-2">
            <Separator className="absolute -top-3 left-0 w-full" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex gap-3 items-center">
                      <Avatar className="h-9 w-9 ">
                        <AvatarImage
                          className="rounded-full"
                          src={user?.photoURL ?? undefined}
                        />
                      </Avatar>

                      <div className="flex flex-col items-start">
                        <p className="m-0">{user?.displayName}</p>
                        <p className="text-[9px] text-gray-400 m-0">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <MoreHorizontal size={20} />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="popover-content ml-2 p-2">
                <div>
                  <SidebarButton
                    size="sm"
                    icon={LogOut}
                    className="w-full"
                    onClick={logOutHandler}
                  >
                    Log out from {user?.displayName}
                  </SidebarButton>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </aside>
  );
}
