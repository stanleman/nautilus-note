"use client";

import { SidebarItems } from "@/types";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { LogOut, Menu, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { SidebarButtonSheet as SidebarButton } from "./sidebar-button";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
}

export function SidebarMobile(props: SidebarMobileProps) {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="fixed top-3 left-3">
          <Menu size={20} />
        </Button>
      </SheetTrigger>

      <SheetContent className="px-3 py-4" side="left" hideClose>
        <SheetHeader className="flex flex-row justify-between items-center space-y-0">
          <span className="mx-3 text-lg font-semibold text-[#90E4C1]">
            Nautilus Note
          </span>

          <SheetClose asChild>
            <Button className="h-7 w-7 p-0" variant="ghost">
              <X size={15} />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="h-full">
          <div className="mt-5 flex flex-col w-full gap-1">
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

          <div className="absolute w-full bottom-4 px-1 left-0 pt-3">
            <Separator className="absolute -top-3 left-0 w-full" />

            <Drawer>
              <DrawerTrigger asChild>
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
              </DrawerTrigger>

              <DrawerContent className="popover-content mb-2 p-2">
                <div className="flex flex-col mt-2 space-y-2">
                  <SidebarButton
                    size="sm"
                    icon={LogOut}
                    className="w-full"
                    onClick={logOutHandler}
                  >
                    Log out from {user?.displayName}
                  </SidebarButton>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
