import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: 'Archive | %s',
    default: 'Archive',
  },
  description: 'All archive projects of the user',
}

export default function ArchiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
