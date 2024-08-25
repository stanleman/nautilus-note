import { Button } from "@/components/ui/button";
import React from "react";
import { Settings } from "lucide-react";

function Navigation({ setOpenSetting }: { setOpenSetting: any }) {
  return (
    <nav className="pt-5 text-white flex gap-4 items-center">
      <h2 className="font-bold text-2xl">Pomodoro</h2>
      <div className="flex items-center gap-3">
        <Button onClick={() => setOpenSetting((value: any) => !value)}>
          <p className="max-[330px]:hidden">Timer settings</p>
          <Settings className="text-sm min-[330px]:ml-2" />
        </Button>
      </div>
    </nav>
  );
}
export default React.memo(Navigation);
