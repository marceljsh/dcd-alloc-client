import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ProjectTimeline from "./ProjectTimeline"
import { TooltipProvider } from "@/components/ui/tooltip"
import { within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

describe("ProjectTimeline Component", () => {
  beforeEach(() => {
    render(
      <TooltipProvider delayDuration={0}>
        <ProjectTimeline />
      </TooltipProvider>
    )
  })

  it("renders without crashing", () => {
    expect(screen.getByText("Stage / Task")).toBeInTheDocument()
  })

  it("renders month headers", () => {
    const months = screen.getAllByText(/\w+ \d{4}/)
    expect(months.length).toBeGreaterThan(0)
  })

  it("renders daily headers", () => {
    const days = screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/)
    expect(days.length).toBeGreaterThan(0)
  })

  it("renders stage names", () => {
    expect(screen.getByText(/^Design$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Development$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Testing$/i)).toBeInTheDocument()
    expect(screen.getByText(/^Market Launch$/i)).toBeInTheDocument()
  })

  it("renders at least one task bar", () => {
    const tasks = screen.getAllByTitle(/.+/)
    expect(tasks.length).toBeGreaterThan(0)
  })

  it("shows tooltip info when hovering over a task", async () => {
  const task = screen.getAllByTitle(/.+/)[0]
  fireEvent.mouseEnter(task)

  // Cari di document.body karena Radix render tooltip ke portal
  await waitFor(() => {
    expect(
      within(document.body).getByText(/story points/i)
    ).toBeInTheDocument()
  })
})
})
