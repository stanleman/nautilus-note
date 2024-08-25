import React from "react";
import { FiX } from "react-icons/fi";
import { Separator } from "@/components/ui/separator";

interface ModalSettingProps {
  pomodoroRef: any;
  shortBreakRef: any;
  longBreakRef: any;
  openSetting: any;
  setOpenSetting: any;
  updateTimeDefaultValue: any;
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

function ModalSetting({
  pomodoroRef,
  shortBreakRef,
  longBreakRef,
  openSetting,
  setOpenSetting,
  updateTimeDefaultValue,
  pomodoro,
  shortBreak,
  longBreak,
}: ModalSettingProps) {
  const inputs = [
    {
      value: "Pomodoro",
      ref: pomodoroRef,
      defaultValue: pomodoro,
    },
    {
      value: "Short Break",
      ref: shortBreakRef,
      defaultValue: shortBreak,
    },
    {
      value: "Long Break",
      ref: longBreakRef,
      defaultValue: longBreak,
    },
  ];

  return (
    <>
      <div
        className={`absolute h-full w-full left-0 top-0 bg-black bg-opacity-30 ${
          openSetting ? "" : "hidden"
        }`}
        onClick={() => setOpenSetting(false)}
      ></div>
      <div
        className={`max-w-xl bg-[#020817] border-3 border-slate-600 absolute sm:w-96 w-11/12 left-1/2 top-1/2 p-5 rounded-md ${
          openSetting ? "" : "hidden"
        }`}
        style={{
          transform: "translate(-50%,-50%)",
        }}
      >
        <div className="text-white flex justify-between items-center">
          <h1 className="text-xl font-bold ">Time setting</h1>
          <FiX
            className="text-2xl cursor-pointer"
            onClick={() => setOpenSetting(false)}
          />
        </div>
        {/* <div className="h-1 w-full bg-white mt-5 mb-5"></div> */}
        <Separator className="mt-4 mb-4" />
        <div className="flex gap-5">
          {inputs.map((input, index) => {
            return (
              <div key={index}>
                <h1 className="text-white text-sm">{input.value}</h1>
                <input
                  defaultValue={input.defaultValue}
                  type="number"
                  className="w-full bg-white bg-opacity-30 py-2 rounded outline-none text-center"
                  ref={input.ref}
                />
              </div>
            );
          })}
        </div>
        <button
          className="bg-[#90E4C1] uppercase w-full mt-5 text-white rounded py-2"
          onClick={updateTimeDefaultValue}
        >
          Save
        </button>
      </div>
    </>
  );
}

export default React.memo(ModalSetting);
