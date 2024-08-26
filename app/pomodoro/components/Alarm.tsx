import React from "react";

const Alarm = React.forwardRef((_, ref: any) => {
  return (
    <audio ref={ref}>
      <source src="/alarm.mp3" type="audio/mp3" />
    </audio>
  );
});

Alarm.displayName = "Alarm";

export default React.memo(Alarm);
