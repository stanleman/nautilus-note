"use client";

import { useEffect, useState } from "react";
import app from "@/config.js";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditUser from "./editUser";
import { SquareKanban, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PremiumUser from "./premiumUser";
import StandardUser from "./standardUser";

export default function Profile() {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
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

  const fetchUsers = async () => {
    if (user) {
      console.log(user.uid);
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
    <div className="sm:ml-[300px] mx-5 sm:mt-4 mt-16 ">
      <div className="flex gap-4 items-center">
        <h2 className="font-bold text-2xl">Your Profile</h2>
        <Button
          className="bg-red-500 hover:bg-red-800 text-white"
          onClick={logOutHandler}
        >
          Sign out
        </Button>
      </div>
      <div>
        {userData ? (
          <div>
            <Toaster richColors closeButton />
            <EditUser userData={userData} onUserEdited={fetchUsers} />

            <div className="flex gap-2 mt-10">
              <h2 className="font-bold text-2xl ">Your Plan</h2>
              <Badge
                className={`${
                  userData.isPremium
                    ? "bg-[#90E4C1] hover:bg-[#90E4C1]"
                    : "bg-blue-400 hover:bg-blue-400"
                }`}
              >
                {userData.isPremium ? (
                  <p>Premium user</p>
                ) : (
                  <p>Standard user</p>
                )}
              </Badge>
            </div>

            <div className="w-full grid grid-cols-2 mt-3 gap-5 mb-10">
              <div
                className={`list-style flex flex-col items-center rounded-lg py-5 ${
                  !userData.isPremium ? "!border-2 !border-blue-400" : ""
                }`}
              >
                <h1 className="text-3xl font-bold text-blue-400">Standard</h1>

                <h1 className="text-[55px]">RM 0</h1>
                <h5 className="font-semibold text-gray-300 mb-4">per month</h5>

                <Separator />

                <div className="flex gap-2 mt-4 mb-4">
                  <SquareKanban />
                  <p>Up to 10 boards at a time</p>
                </div>
                <Separator />

                <div className="flex gap-2 mt-4 mb-4">
                  <List />
                  <p>Unlimited lists and cards</p>
                </div>
                <Separator />

                <StandardUser userData={userData} onUserEdited={fetchUsers} />
              </div>

              <div
                className={`list-style flex flex-col items-center rounded-lg py-5 ${
                  userData.isPremium ? "!border-2 !border-[#90E4C1]" : ""
                }`}
              >
                <h1 className="text-3xl font-bold text-[#90E4C1]">Premium</h1>

                <h1 className="text-[55px]">RM 20</h1>
                <h5 className="font-semibold text-gray-300 mb-4">per month</h5>

                <Separator />

                <div className="flex gap-2 mt-4 mb-4">
                  <SquareKanban />
                  <p>Unlimited boards for use</p>
                </div>
                <Separator />

                <div className="flex gap-2 mt-4 mb-4">
                  <List />
                  <p>Unlimited lists and cards</p>
                </div>
                <Separator />
                <PremiumUser userData={userData} onUserEdited={fetchUsers} />
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
