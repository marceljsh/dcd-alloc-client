import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// --- PERUBAHAN UTAMA ADA DI SINI ---
// Menggunakan path relatif untuk mengimpor komponen dan data.
// Path ini mengasumsikan file tes berada di `src/app/history/__tests__/page.test.tsx`

// Dari `__tests__` -> `history` -> `app` -> `page.tsx`
import HistoryPage from "../page"; 

// Dari `__tests__` -> `history` -> `app` -> `src` -> `data`
import rawProjects from "../../../data/projects.json";

// --- MOCKING SETUP DENGAN PATH RELATIF ---

jest.mock("../../../data/projects.json", () => [
  {
    id: "1", code: "PROJ-001", name: "Project Phoenix", team: "Alpha", category: "Big",
    priority: "High", crew: 15, budget: 500000000, startDate: "2023-01-15", endDate: "2023-12-20",
  },
  {
    id: "2", code: "PROJ-002", name: "Project Titan", team: "Bravo", category: "Medium",
    priority: "Medium", crew: 8, budget: 250000000, startDate: "2023-02-10", endDate: "2023-08-30",
  },
  {
    id: "3", code: "PROJ-003", name: "Project Gemini", team: "Alpha", category: "Small",
    priority: "Critical", crew: 5, budget: 80000000, startDate: "2023-03-01", endDate: "2023-06-15",
  },
]);

// Mock komponen UI juga menggunakan path relatif
jest.mock("../../../components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock("../../../components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("../../../components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
}));

jest.mock("../../../components/ui/input", () => {
    // eslint-disable-next-line react/display-name
    return { Input: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />) };
});

jest.mock("../../../components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../../../components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <div>
      <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
      <label>{children}</label>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Search: () => <span>Search Icon</span>,
  Users: () => <span>Users Icon</span>,
  Filter: () => <span>Filter Icon</span>,
}));

// --- TEST SUITE (Logika tes tetap sama) ---
describe("HistoryPage Component (Relative Path Test)", () => {

  const setup = () => {
    const user = userEvent.setup();
    render(<HistoryPage />);
    return { user };
  };

  test("should render initial layout and data", () => {
    setup();
    expect(screen.getByRole("heading", { name: /History/i })).toBeInTheDocument();
    expect(screen.getByText("Project Phoenix")).toBeInTheDocument();
    expect(screen.getByText("Project Titan")).toBeInTheDocument();
  });

  test("should filter projects using search input", async () => {
    const { user } = setup();
    const searchInput = screen.getByPlaceholderText(/Search history projects.../i);
    await user.type(searchInput, "Gemini");
    expect(screen.getByText("Project Gemini")).toBeInTheDocument();
    expect(screen.queryByText("Project Phoenix")).not.toBeInTheDocument();
  });
  
  test("should filter by category and clear filter", async () => {
    const { user } = setup();
    const mediumCheckbox = screen.getByRole("checkbox", { name: "Medium" });

    // Terapkan filter
    await user.click(mediumCheckbox);
    expect(screen.getByText("Project Titan")).toBeInTheDocument();
    expect(screen.queryByText("Project Gemini")).not.toBeInTheDocument();

    // Hapus filter
    await user.click(mediumCheckbox);
    expect(screen.getByText("Project Titan")).toBeInTheDocument();
    expect(screen.getByText("Project Gemini")).toBeInTheDocument();
  });

  test("should combine multiple filters", async () => {
    const { user } = setup();
    const alphaTeamCheckbox = screen.getByRole("checkbox", { name: "Alpha" });
    const highPriorityCheckbox = screen.getByRole("checkbox", { name: "High" });

    await user.click(alphaTeamCheckbox);
    await user.click(highPriorityCheckbox);
    
    expect(screen.getByText("Project Phoenix")).toBeInTheDocument();
    expect(screen.queryByText("Project Gemini")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Titan")).not.toBeInTheDocument();
  });
  
  test("should sort the table by budget", async () => {
    const { user } = setup();
    const budgetHeader = screen.getByRole("columnheader", { name: /Budget/i });

    // Sort Ascending (budget terkecil di atas)
    await user.click(budgetHeader);
    let rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Project Gemini")).toBeInTheDocument();

    // Sort Descending (budget terbesar di atas)
    await user.click(budgetHeader);
    rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Project Phoenix")).toBeInTheDocument();
  });
});