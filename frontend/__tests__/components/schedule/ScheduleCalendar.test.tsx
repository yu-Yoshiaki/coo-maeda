import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar"
import { fireEvent, render } from "@testing-library/react"

// モックスケジュール
const mockSchedules = [
  {
    id: "1",
    title: "ミーティング",
    startDate: "2024-01-01T14:00:00",
    endDate: "2024-01-01T15:00:00",
    location: "会議室A",
    isAllDay: false,
  },
]

// react-big-calendarのモック
jest.mock("react-big-calendar", () => ({
  Calendar: ({ events, onSelectEvent, onSelectSlot }: any) => (
    <div>
      {events.map((event: any) => (
        <div
          key={event.id}
          data-testid="calendar-event"
          onClick={() => onSelectEvent(event)}
        >
          {event.title}
        </div>
      ))}
      <div
        data-testid="calendar-slot"
        onClick={() =>
          onSelectSlot({
            start: new Date("2024-01-01T10:00:00"),
            end: new Date("2024-01-01T11:00:00"),
          })}
      />
    </div>
  ),
}))

describe("scheduleCalendar", () => {
  it("スケジュールをクリックするとonSelectEventが呼ばれる", () => {
    const mockOnSelectEvent = jest.fn()
    const { getByTestId } = render(
      <ScheduleCalendar
        schedules={mockSchedules}
        onSelectEvent={mockOnSelectEvent}
        onSelectSlot={() => {}}
      />,
    )

    fireEvent.click(getByTestId("calendar-event"))
    expect(mockOnSelectEvent).toHaveBeenCalledWith({
      ...mockSchedules[0],
      start: new Date("2024-01-01T14:00:00"),
      end: new Date("2024-01-01T15:00:00"),
    })
  })

  it("空きスロットをクリックするとonSelectSlotが呼ばれる", () => {
    const mockOnSelectSlot = jest.fn()
    const { getByTestId } = render(
      <ScheduleCalendar
        schedules={mockSchedules}
        onSelectEvent={() => {}}
        onSelectSlot={mockOnSelectSlot}
      />,
    )

    fireEvent.click(getByTestId("calendar-slot"))
    expect(mockOnSelectSlot).toHaveBeenCalledWith({
      start: new Date("2024-01-01T10:00:00"),
      end: new Date("2024-01-01T11:00:00"),
    })
  })
})
