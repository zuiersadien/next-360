import React, { useCallback, useMemo } from "react";
import { GpsPoint, Marker, PointMarker, Tag } from "@prisma/client";
import { Badge } from "primereact/badge";

export type PointMarkerWithTags = PointMarker & {
  tags?: Tag[];
  marker: Marker | undefined;
};

type GroupedMarker = {
  markerId: number;
  marker: Marker;
  items: PointMarkerWithTags[];
};

interface LegendMenuProps {
  tags: Tag[];
  pointsMarkers: PointMarkerWithTags[];
  onSelectPosition: (pos: GpsPoint) => void;
  visibleGroups: Record<number, boolean>;
  setVisibleGroups: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}

const PointMarkerItem = React.memo(
  ({
    item,
    enabled,
    onSelectPosition,
  }: {
    item: PointMarkerWithTags;
    enabled: boolean;
    onSelectPosition: (pos: GpsPoint) => void;
  }) => {
    const tagColor =
      item.tags && item.tags.length > 0 ? item.tags[0].color : undefined;

    return (
      <div
        className={`flex flex-col gap-1 p-2 pl-4 rounded text-xs ${
          enabled
            ? "cursor-pointer hover:bg-gray-100"
            : "opacity-40 cursor-not-allowed"
        }`}
        onClick={() => enabled && onSelectPosition(item as any)}
      >
        <div className="flex items-center gap-2">
          <i className="pi pi-map-marker text-sm text-blue-500" />
          <span className="font-semibold">{item?.comment}</span>
        </div>
        <div className="ml-6 text-[11px] text-gray-600 leading-tight flex items-center gap-1">
          {tagColor && (
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{
                backgroundColor: `#${tagColor}`,
                boxShadow: `0 0 5px #${tagColor}`,
              }}
            />
          )}
          <div>
            <span className="font-medium"></span> {item.comment}
          </div>
        </div>
        <div className="ml-6 text-[11px] text-gray-600 leading-tight">
          <div>
            <span className="font-medium">Lat:</span> {item.lat}
          </div>
          <div>
            <span className="font-medium">Lon:</span> {item.lon}
          </div>
        </div>
      </div>
    );
  },
);

const GroupMenuItem = React.memo(
  ({
    marker,
    items,
    enabled,
    onToggle,
    onSelect,
    forceExpanded,
  }: {
    marker: Marker;
    items: PointMarkerWithTags[];
    enabled: boolean;
    onToggle: () => void;
    onSelect: (pos: GpsPoint) => void;
    forceExpanded?: boolean;
  }) => {
    const [expanded, setExpanded] = React.useState(false);

    React.useEffect(() => {
      if (forceExpanded !== undefined) {
        setExpanded(forceExpanded);
      }
    }, [forceExpanded]);

    const toggleExpanded = React.useCallback(() => {
      setExpanded((v) => !v);
    }, []);

    return (
      <div
        className="mb-2 rounded-md shadow-sm border border-gray-300 bg-white"
        style={{ overflow: "hidden" }}
        onClick={toggleExpanded}
      >
        <div
          className={`flex items-center justify-between px-3 py-2 cursor-pointer select-none ${
            enabled ? "hover:bg-gray-100" : "opacity-50"
          }`}
        >
          <div className="flex items-center gap-2" onClick={toggleExpanded}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 cursor-pointer"
            />
            <img
              src={marker.icon}
              alt={marker.name}
              className="w-5 h-5 object-contain"
            />

            <span className="font-semibold text-sm">{marker.name}</span>
            <span className="ml-2">
              <Badge value={items.length} severity="info" />
            </span>
          </div>
          <button
            className="text-base font-bold px-2 py-0.5 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            aria-label={expanded ? "Contraer grupo" : "Expandir grupo"}
            type="button"
          >
            {expanded ? "−" : "+"}
          </button>
        </div>

        <div
          className="pl-4 pr-3 pb-3"
          style={{
            maxHeight: expanded && enabled ? 800 : 0,
            transition: "max-height 0.3s ease",
            overflow: "hidden",
          }}
        >
          {expanded &&
            enabled &&
            items.map((item) => (
              <PointMarkerItem
                key={item.id}
                item={item}
                enabled={enabled}
                onSelectPosition={onSelect}
              />
            ))}
        </div>
      </div>
    );
  },
);

const LegendMenu: React.FC<LegendMenuProps> = ({
  tags,
  pointsMarkers,
  onSelectPosition,
  visibleGroups,
  setVisibleGroups,
}) => {
  const pointsWithTags = useMemo(() => {
    if (!tags?.length) return pointsMarkers;

    return pointsMarkers.map((pm) => ({
      ...pm,
      tags: pm.Tags?.map((tagId) => tags.find((t) => t.id === tagId)).filter(
        Boolean,
      ) as Tag[],
    }));
  }, [pointsMarkers, tags]);

  const groups = useMemo(() => {
    const map = new Map<number, GroupedMarker>();
    for (const item of pointsWithTags) {
      if (!map.has(item.markerId || 0)) {
        map.set(item.markerId || 0, {
          markerId: item.markerId!,
          marker: item.marker!,
          items: [],
        });
      }
      map.get(item.markerId || 0)!.items.push(item);
    }
    return Array.from(map.values());
  }, [pointsWithTags]);

  React.useEffect(() => {
    if (groups.length > 0) {
      setVisibleGroups((prev) => {
        if (Object.keys(prev).length === 0) {
          return Object.fromEntries(groups.map((g) => [g.markerId, true]));
        }
        return prev;
      });
    }
  }, [groups, setVisibleGroups]);

  const toggleGroup = useCallback(
    (markerId: number) => {
      setVisibleGroups((prev) => ({
        ...prev,
        [markerId]: !prev[markerId],
      }));
    },
    [setVisibleGroups],
  );

  const allVisible = useMemo(
    () => groups.length > 0 && groups.every((g) => visibleGroups[g.markerId]),
    [groups, visibleGroups],
  );

  const toggleAll = () => {
    const newState = !allVisible;
    setVisibleGroups(
      Object.fromEntries(groups.map((g) => [g.markerId, newState])),
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={allVisible}
          onChange={toggleAll}
          id="toggle-all-groups"
          className="w-5 h-5 cursor-pointer"
        />
        <label
          htmlFor="toggle-all-groups"
          className="select-none cursor-pointer"
        >
          {allVisible ? "Cerrar todos los grupos" : "Abrir todos los grupos"}
        </label>
      </div>

      {groups.map(({ markerId, marker, items }) => (
        <GroupMenuItem
          key={markerId}
          marker={marker}
          items={items}
          enabled={visibleGroups[markerId] ?? false}
          onToggle={() => toggleGroup(markerId)}
          onSelect={onSelectPosition}
          forceExpanded={visibleGroups[markerId] ?? false}
        />
      ))}
    </div>
  );
};

export default LegendMenu;
