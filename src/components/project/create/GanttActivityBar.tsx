interface GanttActivityBarProps {
  activity: string;
  startPosition: number;
  endPosition: number;
  datesLength: number;
  isSubActivity?: boolean;
  fte?: number;
  viewMode?: "normal" | "fte-visualization";
}

export function GanttActivityBar({
  activity,
  startPosition,
  endPosition,
  datesLength,
  isSubActivity = false,
  fte = 1,
  viewMode = "normal",
}: GanttActivityBarProps) {
  const bgColor = isSubActivity ? "bg-blue-400" : "bg-blue-500";

  // Untuk FTE visualization mode, hanya tampilkan pada subactivity
  if (viewMode === "fte-visualization" && isSubActivity) {
    const ftePercentage = Math.min(fte * 100, 100);
    const isOverflow = fte > 1;

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
            className="relative border border-primary/20 rounded mx-1 my-2 overflow-hidden bg-primary/10"
            style={{
              gridColumnStart: startPosition,
              gridColumnEnd: endPosition,
            }}
          >
            {/* Simple vertical fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                isOverflow ? "bg-destructive" : "bg-primary/70"
              }`}
              style={{ height: `${ftePercentage}%` }}
            />

            {/* Simple overflow indicator */}
            {isOverflow && (
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-1 bg-destructive rounded-full"></div>
              </div>
            )}

            {/* Simple percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-xs font-medium ${
                  ftePercentage > 50
                    ? "text-primary-foreground"
                    : "text-primary"
                }`}
              >
                {fte} fte
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
