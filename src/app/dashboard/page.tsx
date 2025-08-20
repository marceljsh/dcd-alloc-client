import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <Image
        src="https://picsum.photos/500"
        alt="Lorem Picsum"
        width={500}
        height={500}
        className="mb-30 rounded-lg shadow-lg"
      />
    </div>
  );
}
