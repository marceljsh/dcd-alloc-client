// __tests__/ProjectsPage.test.tsx
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import ProjectsPage from "../page"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock ResizeObserver (Radix ScrollArea / Dialog)
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver

// Mock project data agar menu dan dialog bisa muncul
const mockProjects = [
  { code: "P001", name: "Project Alpha" },
  { code: "P002", name: "Project Beta" },
]

describe("ProjectsPage", () => {
  test("renders page title and add project button", () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    expect(screen.getByTestId("page-title")).toHaveTextContent("Projects")
    expect(screen.getByTestId("add-project-button")).toBeInTheDocument()
  })

  test("renders statistics cards", () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    expect(screen.getByTestId("stat-total-projects")).toBeInTheDocument()
    expect(screen.getByTestId("stat-total-budget")).toBeInTheDocument()
    expect(screen.getByTestId("stat-big-projects")).toBeInTheDocument()
    expect(screen.getByTestId("stat-critical-projects")).toBeInTheDocument()
  })

  test("renders project table with rows", () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    const table = screen.getByTestId("project-table")
    expect(table).toBeInTheDocument()

    const rows = screen.getAllByTestId(/project-row-/)
    expect(rows.length).toBeGreaterThan(0)
  })

  test("opens project menu and shows actions", async () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    const menuButtons = screen.getAllByTestId(/menu-button-/)
    await userEvent.click(menuButtons[0])

    const menu = within(document.body)
    await menu.findByText(/view details/i)
    await menu.findByText(/view timeline/i)
    await menu.findByText(/archive/i)
  })

  test("opens project detail dialog", async () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    const menuButtons = screen.getAllByTestId(/menu-button-/)
    await userEvent.click(menuButtons[0])

    const menu = within(document.body)
    const viewDetailsBtn = await menu.findByText(/view details/i)
    await userEvent.click(viewDetailsBtn)

    // Tunggu dialog muncul di portal
    const dialog = within(document.body)
    await waitFor(() => {
      expect(dialog.getByTestId("project-detail-dialog")).toBeInTheDocument()
    })
  })

  test("opens project timeline dialog", async () => {
  render(<ProjectsPage />)

  const menuButtons = await screen.getAllByTestId(/menu-button-/)
  await userEvent.click(menuButtons[0])

  const viewTimelineBtn = await screen.findByTestId("view-details-timeline")
  await userEvent.click(viewTimelineBtn)

  const timelineDialog = await screen.findByTestId("project-timeline-dialog")
  expect(timelineDialog).toBeInTheDocument()
})

  test("add project dialog opens when clicking add project button", async () => {
    render(<ProjectsPage initialProjects={mockProjects} />)

    const addBtn = screen.getByTestId("add-project-button")
    await userEvent.click(addBtn)

    const dialog = within(document.body)
    await dialog.findByTestId("add-project-dialog")
  })
})
