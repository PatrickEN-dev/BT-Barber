"use client";

import { useState } from "react";
import TimeListComponent from "../../_BookingMenu/TimeListComponent";

interface Props {
  barber: Barber;
}

export const BarbersPageCards = ({ barber }: Props) => {
  const [timeList] = useState<string[]>(generateMockTimes());

  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  return (
    <article className="bg-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row w-full max-w-2xl mx-auto">
      <div className="flex-none w-full sm:w-1/3 h-40 sm:h-auto rounded-lg overflow-hidden bg-neutral-700 flex items-center justify-center">
        {barber.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={barber.imageUrl} alt={barber.name} className="object-cover w-full h-full" />
        ) : (
          <div className="text-center px-2">
            <div className="text-xl font-semibold">{initials(barber.name)}</div>
            <div className="text-sm text-neutral-300">{barber.name}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 pl-0 sm:pl-4 pt-3 sm:pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{barber.name}</h2>
            {barber.rating !== null && (
              <div className="text-sm text-yellow-300">⭐ {barber.rating.toFixed(1)}</div>
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-300 mt-2 line-clamp-3">
          {barber.description ?? "Sem descrição disponível."}
        </p>

        <div className="mt-auto pt-3">
          <TimeListComponent
            timeList={timeList}
            hour={selectedTime}
            handleHourClick={(t) => setSelectedTime(t)}
          />
        </div>
      </div>
    </article>
  );
};

function initials(name?: string) {
  if (!name) return "B";
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function generateMockTimes() {
  return ["09:00", "10:00", "11:30", "13:00", "14:30", "16:00"];
}

export default BarbersPageCards;
