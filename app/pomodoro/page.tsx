"use client";

import React, { useEffect, useRef, useState } from "react";
import Alarm from "./components/Alarm";
import ModalSetting from "./components/ModalSetting";
import Navigation from "./components/Navigation";
import Timer from "./components/Timer";
import {
  doc,
  getDoc,
  updateDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import app from "@/config.js";
import { getAuth, User } from "firebase/auth";

export default function Pomodoro() {
  const db = getFirestore(app);
  const auth = getAuth(app);

  const [pomodoro, setPomodoro] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(10);
  const [seconds, setSecond] = useState(0);
  const [stage, setStage] = useState(0);
  const [consumedSecond, setConsumedSecond] = useState(0);
  const [ticking, setTicking] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);

  const alarmRef = useRef<any>(null);
  const pomodoroRef = useRef<any>(null);
  const shortBreakRef = useRef<any>(null);
  const longBreakRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    const fetchTimerValues = async () => {
      if (user) {
        const docRef = doc(db, "pomodoro", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPomodoro(data.pomodoro);
          setShortBreak(data.shortBreak);
          setLongBreak(data.longBreak);
        } else {
          await setDoc(docRef, {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15,
          });
          setPomodoro(25);
          setShortBreak(5);
          setLongBreak(15);
        }
      } else {
        console.log("user not found in pomodoro");
      }
    };

    fetchTimerValues();
  }, [user]);

  const updateTimeDefaultValue = async () => {
    if (user) {
      const newPomodoro = pomodoroRef.current?.value;
      const newShortBreak = shortBreakRef.current?.value;
      const newLongBreak = longBreakRef.current?.value;

      setPomodoro(newPomodoro);
      setShortBreak(newShortBreak);
      setLongBreak(newLongBreak);
      setOpenSetting(false);
      setSecond(0);
      setConsumedSecond(0);

      const docRef = doc(db, "pomodoro", user.uid);
      await updateDoc(docRef, {
        pomodoro: newPomodoro,
        shortBreak: newShortBreak,
        longBreak: newLongBreak,
      });
    }
  };

  const switchStage = (index: any) => {
    const isYes =
      consumedSecond && stage !== index
        ? confirm("Are you sure you want to switch?")
        : false;
    if (isYes) {
      reset();
      setStage(index);
    } else if (!consumedSecond) {
      setStage(index);
    }
  };

  const getTickingTime = () => {
    const timeStage: { [key: number]: number } = {
      0: pomodoro,
      1: shortBreak,
      2: longBreak,
    };
    return timeStage[stage];
  };

  const updateMinute = () => {
    const updateStage: {
      [key: number]: React.Dispatch<React.SetStateAction<number>>;
    } = {
      0: setPomodoro,
      1: setShortBreak,
      2: setLongBreak,
    };
    return updateStage[stage];
  };

  const reset = () => {
    setConsumedSecond(0);
    setTicking(false);
    setSecond(0);
    updateTimeDefaultValue();
  };

  const timeUp = () => {
    reset();
    setIsTimeUp(true);
    alarmRef.current?.play();
  };

  const clockTicking = () => {
    const minutes = getTickingTime();
    const setMinutes = updateMinute();

    if (minutes === 0 && seconds === 0) {
      timeUp();
    } else if (seconds === 0) {
      setMinutes((minute: any) => minute - 1);
      setSecond(59);
    } else {
      setSecond((second) => second - 1);
    }
  };
  const muteAlarm = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  };

  const startTimer = () => {
    setIsTimeUp(false);
    muteAlarm();
    setTicking((ticking) => !ticking);
  };

  useEffect(() => {
    window.onbeforeunload = () => {
      return consumedSecond ? "Show waring" : null;
    };

    const timer = setInterval(() => {
      if (ticking) {
        setConsumedSecond((value) => value + 1);
        clockTicking();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [seconds, pomodoro, shortBreak, longBreak, ticking]);

  return (
    <div className="sm:ml-[300px] mx-5 sm:mt-0 mt-16">
      <div className="!w-full h-screen ">
        <Navigation setOpenSetting={setOpenSetting} />
        <Timer
          stage={stage}
          switchStage={switchStage}
          getTickingTime={getTickingTime}
          seconds={seconds}
          ticking={ticking}
          startTimer={startTimer}
          muteAlarm={muteAlarm}
          isTimeUp={isTimeUp}
          reset={reset}
        />

        <Alarm ref={alarmRef} />
        <ModalSetting
          openSetting={openSetting}
          setOpenSetting={setOpenSetting}
          pomodoroRef={pomodoroRef}
          shortBreakRef={shortBreakRef}
          longBreakRef={longBreakRef}
          updateTimeDefaultValue={updateTimeDefaultValue}
          pomodoro={pomodoro}
          shortBreak={shortBreak}
          longBreak={longBreak}
        />
      </div>
    </div>
  );
}
