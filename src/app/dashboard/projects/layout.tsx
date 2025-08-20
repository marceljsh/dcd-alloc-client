import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: 'Projects | %s',
    default: 'Projects',
  },
  description: 'All projects of the user',
}

export default function ProjectsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
