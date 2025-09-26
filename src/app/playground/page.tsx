import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function App() {
  const datas = [
    { name: "Person", data: [12, 4, 2, 34, 5, 1] },
    { name: "Person 1", data: [4, 1, 2, 3, 4, 5, 6] },
    { name: "Person 2", data: [0, 1, 2, 3, 4, 5, 6, 7, 1, 1, 1, 1, 1, 1, 1, 12, 23, 3, 4, 121, 12, 1] },
  ];

  return (
    <div className="flex border">
      {/* Kolom kiri: daftar orang */}
      <div className="w-[25%] border border-pink-500 flex flex-col">
        {datas.map((person, idx) => (
          <div
            key={idx}
            className="h-12 flex items-center justify-center border-b bg-gray-100"
          >
            {person.name}
          </div>
        ))}
      </div>

      {/* Kolom kanan: deretan angka */}
      <div className="w-[75%] border border-pink-500 overflow-x-auto">
        <ScrollArea>
          <div className="flex flex-col">
            {datas.map((person, idx) => (
              <div key={idx} className="flex">
                {person.data.map((val, i) => (
                  <div
                    key={i}
                    className="w-20 h-12 flex-shrink-0 flex items-center justify-center border"
                  >
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
