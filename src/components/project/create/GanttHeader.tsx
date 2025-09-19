import { getMonthAbbr } from "@/lib/dates";

interface GanttHeaderProps {
  dates: Date[];
  groupedDates: Record<string, Date[]>;
}

export function GanttHeader({ dates, groupedDates }: GanttHeaderProps) {
  return (
    <div className="h-[72px] divide-y bg-gray-50 border-b">
      {/* Month header row */}
      <div className="grid grid-flow-col auto-cols-[50px] h-9">
        {Object.entries(groupedDates).map(([monthYear, monthDates], i) => {
          const isFirst = i === 0;
          const isLast = i === Object.keys(groupedDates).length - 1;

          return (
            <div
              key={monthYear}
              className="text-xs font-bold text-center bg-gray-50 whitespace-nowrap overflow-visible flex items-center justify-center"
              style={{
                gridColumn: `span ${monthDates.length}`,
                zIndex: isFirst || isLast ? 10 : 1,
                paddingLeft: isFirst ? "12px" : "0px",
                paddingRight: isLast ? "12px" : "0px",
              }}
            >
              {getMonthAbbr(monthDates[0])} {monthDates[0].getFullYear()}
            </div>
          );
        })}
      </div>

      {/* Date header row */}
      <div className="grid divide-x grid-flow-col auto-cols-[50px] place-items-center h-9">
        {dates.map((date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div
              key={date.toISOString()}
              className={`text-xs w-full text-center font-medium flex items-center justify-center h-full ${
                isWeekend ? "bg-gray-100 text-gray-500" : ""
              }`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
