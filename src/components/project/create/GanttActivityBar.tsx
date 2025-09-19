interface GanttActivityBarProps {
  activity: string;
  startPosition: number;
  endPosition: number;
  datesLength: number;
  isSubActivity?: boolean;
}

export function GanttActivityBar({
  activity,
  startPosition,
  endPosition,
  datesLength,
  isSubActivity = false,
}: GanttActivityBarProps) {
  const bgColor = isSubActivity ? "bg-blue-400" : "bg-blue-500";

  return (
    <div className="relative border-b h-12">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${datesLength}, 50px)`,
          height: "100%",
        }}
      >
        <div
          className={`relative ${bgColor} opacity-75 rounded mx-1 my-2`}
          style={{
            gridColumnStart: startPosition,
            gridColumnEnd: endPosition,
          }}
        >
          <div className={`h-full w-full ${bgColor} rounded-md opacity-70`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white truncate px-1">
              {activity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
