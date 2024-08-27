"use client";

import { SidebarItems } from "@/types";
import SidebarButton from "./sidebar-button";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";

interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
}

export default function SidebarDesktop(props: SidebarDesktopProps) {
  const db = getFirestore(app);
  const pathname = usePathname();

  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
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

  // useEffect(() => {
  //   if (auth.currentUser) {
  //     setUser(auth.currentUser);
  //   } else {
  //     setUser(null);
  //   }
  // }, [auth.currentUser]);

  const fetchUsers = async () => {
    console.log("fetching user");
    if (user) {
      const usersRef = doc(db, "users", user?.uid);

      getDoc(usersRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        })
        .catch(() => {
          console.log("Failed to fetch board data");
        });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

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

  useEffect(() => {
    console.log(pathname == "/landing");
  });

  if (pathname == "/landing") {
    return <></>;
  }

  return (
    <div className="">
      {userData ? (
        <aside className="w-[270px] max-w-xs h-screen fixed left-0 top-0  border-r">
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
            </div>

            <div className="px-3">
              <p className="font-semibold text-white text-lg mt-7">
                Your boards
              </p>
              {!boardsData || boardsData?.length == 0 ? (
                <p className="mt-2">No boards</p>
              ) : (
                <div className="flex flex-col gap-3 mt-2 px-1 overflow-y-auto  h-[450px]">
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
        </aside>
      ) : (
        <></>
      )}
    </div>
  );
}
