import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: 'Timeline | %s',
    default: 'Timeline',
  },
  description: 'All timeline events of the user',
}

export default function TimelineLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
