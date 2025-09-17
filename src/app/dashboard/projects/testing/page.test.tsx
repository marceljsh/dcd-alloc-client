// __tests__/ProjectsPage.test.tsx
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import ProjectsPage from "../page"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock ResizeObserver (Radix ScrollArea / Dialog)
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe("Projects Page", () => {
  test("renders page title and add project button", () => {
    render(<ProjectsPage />)
    expect(screen.getByTestId("page-title")).toHaveTextContent("Projects")
    expect(screen.getByTestId("add-project-button")).toBeInTheDocument()
  })

  test("renders statistics cards", () => {
    render(<ProjectsPage />)
    expect(screen.getByTestId("stat-total-projects")).toBeInTheDocument()
    expect(screen.getByTestId("stat-total-budget")).toBeInTheDocument()
    expect(screen.getByTestId("stat-big-projects")).toBeInTheDocument()
    expect(screen.getByTestId("stat-critical-projects")).toBeInTheDocument()
  })

  test("renders project table with rows", () => {
    render(<ProjectsPage />)
    const table = screen.getByTestId("project-table")
    expect(table).toBeInTheDocument()

    const rows = screen.getAllByTestId(/project-row-/)
    expect(rows.length).toBeGreaterThan(0)
  })

  test("opens menu for a project row", async () => {
    render(<ProjectsPage />)

    const menuButtons = screen.getAllByTestId(/menu-button-/)
    await userEvent.click(menuButtons[0])

    const menu = within(document.body)
    await menu.findByText(/view details/i)
    await menu.findByText(/view timeline/i)
  })

  test("opens project detail dialog", async () => {
    render(<ProjectsPage />)

    const menuButtons = screen.getAllByTestId(/menu-button-/)
    await userEvent.click(menuButtons[0])

    const menu = within(document.body)
    const viewDetailsBtn = await menu.findByText(/view details/i)
    await userEvent.click(viewDetailsBtn)

    await waitFor(() => {
      expect(screen.getByTestId("project-detail-dialog")).toBeInTheDocument()
    })
  })

test("opens project timeline dialog", async () => {
  render(<ProjectsPage />)

  // Klik tombol menu (pakai userEvent supaya async)
  const menuButtons = screen.getAllByTestId(/menu-button-/)
  await userEvent.click(menuButtons[0])

  // Tunggu menu muncul
  const viewTimelineBtn = await screen.findByTestId("view-details-timeline")
  await userEvent.click(viewTimelineBtn)

  // Tunggu dialog muncul
  await waitFor(() => {
    expect(screen.getByTestId("timeline-dialog")).toBeInTheDocument()
  })
})

  test("add project dialog opens when clicking add project button", async () => {
    render(<ProjectsPage />)

    const addBtn = screen.getByTestId("add-project-button")
    await userEvent.click(addBtn)

    const dialog = within(document.body)
    await dialog.findByTestId("add-project-dialog")
  })
})
