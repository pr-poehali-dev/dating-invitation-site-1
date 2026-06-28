import { useState } from "react";
import ScatteredPetals from "@/components/ScatteredPetals";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const DAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function MiniCalendar({ onSelect }: { onSelect: (date: Date) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const handleDay = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelected(d);
    onSelect(d);
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();
  const isSelected = (day: number) =>
    selected &&
    day === selected.getDate() &&
    viewMonth === selected.getMonth() &&
    viewYear === selected.getFullYear();

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS_SHORT.map((d) => (
          <span key={d} className="cal-day-name">{d}</span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e-${i}`} />
          ) : (
            <button
              key={`d-${day}`}
              className={`cal-day ${isToday(day) ? "cal-today" : ""} ${isSelected(day) ? "cal-selected" : ""}`}
              onClick={() => handleDay(day)}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default function DatePickerScreen({
  place,
  onDone,
  animate = true,
}: {
  place: { name: string; img: string };
  onDone: (date: Date) => void;
  animate?: boolean;
}) {
  const [showCal, setShowCal] = useState(false);
  const [pickedDate, setPickedDate] = useState<Date | null>(null);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleSelect = (d: Date) => {
    setPickedDate(d);
    setShowCal(false);
  };

  return (
    <div className="meme-page places-page">
      <ScatteredPetals />
      <div className={`places-card${animate ? " animate-in" : ""}`}>
        <h1 className="places-title">Выбери день 🗓️</h1>

        <button className="date-field" onClick={() => setShowCal((v) => !v)}>
          {pickedDate ? (
            <span className="date-field-filled">{formatDate(pickedDate)}</span>
          ) : (
            <span className="date-field-placeholder">
              Нажми, чтобы выбрать дату
            </span>
          )}
          <span className="date-field-icon">📅</span>
        </button>

        {showCal && <MiniCalendar onSelect={handleSelect} />}

        {pickedDate && (
          <button
            className="bubble-btn bubble-yes date-confirm-btn"
            onClick={() => onDone(pickedDate)}
          >
            Отлично! ✔️
          </button>
        )}
      </div>
    </div>
  );
}