import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectCreation from "../page"

describe("ProjectCreation Page", () => {
  it("renders page title correctly", () => {
    render(<ProjectCreation />)
    expect(screen.getByTestId("page-title")).toHaveTextContent(/create project/i)
  })

  it("renders stepper with correct active and completed states", () => {
    render(<ProjectCreation />)
    const activeStep = screen.getByTestId("step-3")
    expect(within(activeStep).getByText("Results")).toBeInTheDocument()
  })

  it("displays summary cards with correct values", () => {
    render(<ProjectCreation />)

    expect(screen.getByTestId("card-total-budget")).toHaveTextContent(/Rp/)
    expect(screen.getByTestId("card-duration")).toHaveTextContent("6")
    expect(screen.getByTestId("card-team-size")).toHaveTextContent("12")
    expect(screen.getByTestId("card-total-workload")).toHaveTextContent(/jam/)
    expect(screen.getByTestId("card-project-category")).toHaveTextContent(/medium/i)
  })

  it("renders team allocation per role & level correctly", () => {
    render(<ProjectCreation />)

    const deSenior = screen.getByTestId("team-data-engineer-senior")
    expect(within(deSenior).getByText(/budget/i)).toBeInTheDocument()

    const seMiddle = screen.getByTestId("team-software-engineer-middle")
    expect(seMiddle).toBeInTheDocument()
  })

  it("renders activity table with correct rows", () => {
    render(<ProjectCreation />)

    const activityRows = screen.getAllByTestId(/activity-row-/)
    expect(activityRows.length).toBeGreaterThan(0)

    // Contoh test untuk baris pertama
    const firstRow = activityRows[0]
    expect(within(firstRow).getByTestId("activity-name-0")).toHaveTextContent(/design/i)
    expect(within(firstRow).getByTestId("activity-budget-0")).toHaveTextContent(/Rp/)
  })

  it("handles navigation buttons", async () => {
    render(<ProjectCreation />)
    const user = userEvent.setup()

    const prevButton = screen.getByTestId("btn-previous")
    const continueButton = screen.getByTestId("btn-continue")

    expect(prevButton).toBeInTheDocument()
    expect(continueButton).toBeInTheDocument()

    await user.click(continueButton)
    // Di sini kamu bisa assert state atau route jika ada mock router
  })
})
