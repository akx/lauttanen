import * as datefns from "date-fns";
import React from "react";
import { DateInput, IDateFormatProps, TimePicker } from "@blueprintjs/datetime";

const jsDateFormatter: IDateFormatProps = {
  // note that the native implementation of Date functions differs between browsers
  formatDate: (date) => datefns.format(date, "yyyy-MM-dd"),
  parseDate: (str) => new Date(str),
};

type TimeConfigProps = { date: Date; onChange: (date: Date) => void };

export function TimeConfig({ date, onChange }: TimeConfigProps) {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <DateInput
          {...jsDateFormatter}
          showActionsBar
          value={date}
          onChange={(date, isUserChange) =>
            isUserChange ? onChange(date) : null
          }
        />
      </div>
      <div style={{ flex: 1 }}>
        <TimePicker value={date} onChange={onChange} />
      </div>
    </div>
  );
}
