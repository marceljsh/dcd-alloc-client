import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Component from "./OriGantt"

describe("OriGantt Component", () => {
  beforeEach(() => {
    render(<Component />)
  })

  it("renders filters", () => {
  expect(
    screen.getByRole("button", { name: /Project/i })
  ).toBeInTheDocument()
  expect(
    screen.getByRole("button", { name: /Role/i })
  ).toBeInTheDocument()
})

  it("renders empty state by default", () => {
  expect(screen.getByText(/Nothing to display/i)).toBeInTheDocument()
  expect(
    screen.getByText(/Please select projects and roles/i)
  ).toBeInTheDocument()
})

    it("shows empty state with no tasks by default", () => {
  expect(screen.getByText(/Nothing to display/i)).toBeInTheDocument()
    })

  it("does not show project summary cards by default", () => {
  expect(screen.queryByText(/Project Alpha/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Project Beta/i)).not.toBeInTheDocument()
})


  it("does not show role badges by default", () => {
  expect(screen.queryByText(/System Analyst/i)).not.toBeInTheDocument()
})
})
