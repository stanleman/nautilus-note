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
import {
  collection,
  DocumentData,
  getFirestore,
  onSnapshot,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
}

export function SidebarMobile(props: SidebarMobileProps) {
  const db = getFirestore(app);
  const pathname = usePathname();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [boardsData, setBoardsData]: Array<any> = useState();
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

  const fetchBoards = async () => {
    if (user) {
      const boardsRef = collection(db, "boards");

      const q = query(boardsRef, where("userId", "==", user?.uid));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const boardList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as any[];

          setBoardsData(boardList);
        }
      );

      return () => unsubscribe();
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

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

          <div className="px-3">
            <p className="font-semibold text-white text-lg mt-7">Your boards</p>
            {!boardsData || boardsData?.length == 0 ? (
              <p className="mt-2">No boards</p>
            ) : (
              <div className="flex flex-col gap-3 mt-2 px-1 overflow-y-auto  h-[375px] ">
                {boardsData?.map((boardData: any) => (
                  <div
                    className="hover:cursor-pointer w-fit"
                    onClick={() => router.push(`/boards/${boardData.id}`)}
                    key={boardData.id}
                  >
                    <p className="text-slate-300 text-sm hover:text-slate-200 hover:scale-105 duration-200">
                      {boardData.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
