"use client";

import { GpsPoint, Tag } from "@prisma/client";
import { useState } from "react";
import LegendMenu, { PointMarkerWithTags } from "./ProjectLegendCard";

interface LegendMenuProps {
  tags: Tag[];
  pointsMarkers: PointMarkerWithTags[];
  visibleGroups: Record<number, boolean>;
  onSelectPosition: (pos: GpsPoint) => void;
  setVisibleGroups: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}

export default function SidebarLegend({
  tags,
  pointsMarkers,
  visibleGroups,
  onSelectPosition,
  setVisibleGroups,
}: LegendMenuProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl  flex flex-col">
        <div
          className="bg-gradient-to-r px-4 py-1 flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* <h2 className="text-lg font-semibold flex items-center gap-2"> */}
          {/*   <i className="pi pi-list text-base"></i> */}
          {/*   Leyenda */}
          {/* </h2> */}

          <i
            className={`pi pi-chevron-${isOpen ? "up" : "down"} transition-transform duration-300`}
          ></i>
        </div>

        <div
          className={`
            overflow-hidden transition-all duration-300
            ${isOpen ? "h-full opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="p-2 overflow-auto h-full">
            <LegendMenu
              tags={tags}
              pointsMarkers={pointsMarkers}
              onSelectPosition={onSelectPosition}
              visibleGroups={visibleGroups}
              setVisibleGroups={setVisibleGroups}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
