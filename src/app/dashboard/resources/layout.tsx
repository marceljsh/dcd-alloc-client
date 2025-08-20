import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: 'Resources | %s',
    default: 'Resources',
  },
  description: 'All resources',
}

export default function ResourcesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
