"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Stage, Layer, Rect, Group, Text, Circle, Line } from "react-konva";

type PortKind = "in" | "out";

type PortDef = {
  id: string;
  kind: PortKind;
  dx: number;
  dy: number;
};

type Gate = {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  ports: PortDef[];
};

type Connection = {
  id: string;
  from: string;
  to: string;
};

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export default function CanvasEditor() {
  const [size, setSize] = useState({ w: 900, h: 600 });

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [gates, setGates] = useState<Gate[]>([
    {
      id: "gate-and-1",
      type: "AND",
      x: 120,
      y: 140,
      w: 120,
      h: 60,
      ports: [
        { id: "port-gate-and-1-in1", kind: "in", dx: 0, dy: 18 },
        { id: "port-gate-and-1-in2", kind: "in", dx: 0, dy: 44 },
        { id: "port-gate-and-1-out", kind: "out", dx: 120, dy: 31 },
      ],
    },
    {
      id: "gate-or-1",
      type: "OR",
      x: 420,
      y: 140,
      w: 120,
      h: 60,
      ports: [
        { id: "port-gate-or-1-in1", kind: "in", dx: 0, dy: 18 },
        { id: "port-gate-or-1-in2", kind: "in", dx: 0, dy: 44 },
        { id: "port-gate-or-1-out", kind: "out", dx: 120, dy: 31 },
      ],
    },
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [fromPortId, setFromPortId] = useState<string | null>(null);
  const [hoverPortId, setHoverPortId] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const portMap = useMemo(() => {
    const map: Record<string, { x: number; y: number; kind: PortKind }> = {};
    for (const g of gates) {
      for (const p of g.ports) {
        map[p.id] = { x: g.x + p.dx, y: g.y + p.dy, kind: p.kind };
      }
    }
    return map;
  }, [gates]);

  const isValidTarget = (from: string, to: string) => {
    if (from === to) return false;
    return portMap[from]?.kind === "out" && portMap[to]?.kind === "in";
  };

  const updateGatePos = (gateId: string, x: number, y: number) => {
    setGates((prev) => prev.map((g) => (g.id === gateId ? { ...g, x, y } : g)));
  };

  const onPortMouseDown = (e: any, portId: string) => {
    e.cancelBubble = true;

    const kind = portMap[portId]?.kind;
    if (!kind) return;

    if (kind === "out") {
      setFromPortId(portId);
      return;
    }

    if (kind === "in" && fromPortId && isValidTarget(fromPortId, portId)) {
      setConnections((prev) => [...prev, { id: `wire-${uid()}`, from: fromPortId, to: portId }]);
      setFromPortId(null);
      return;
    }
  };

  const onPortEnter = (portId: string) => setHoverPortId(portId);
  const onPortLeave = (portId: string) =>
    setHoverPortId((prev) => (prev === portId ? null : prev));

  const onMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) setPointer(pos);
  };

  const onMouseUp = () => {
    if (!fromPortId) return;

    if (hoverPortId && isValidTarget(fromPortId, hoverPortId)) {
      setConnections((prev) => [...prev, { id: `wire-${uid()}`, from: fromPortId, to: hoverPortId }]);
    }

    setFromPortId(null);
  };

  const grid = useMemo(() => {
    const minor = 25;
    const major = 100;

    const vMinor: React.ReactNode[] = [];
    const hMinor: React.ReactNode[] = [];
    const vMajor: React.ReactNode[] = [];
    const hMajor: React.ReactNode[] = [];

    for (let x = 0; x <= size.w; x += minor) {
      const isMajor = x % major === 0;
      const node = (
        <Line
          key={`grid-v-${x}`}
          id={`grid-v-${x}`}
          points={[x, 0, x, size.h]}
          stroke={isMajor ? "black" : "#bdbdbd"}
          strokeWidth={1}
          opacity={isMajor ? 0.18 : 0.22}
          listening={false}
        />
      );
      (isMajor ? vMajor : vMinor).push(node);
    }

    for (let y = 0; y <= size.h; y += minor) {
      const isMajor = y % major === 0;
      const node = (
        <Line
          key={`grid-h-${y}`}
          id={`grid-h-${y}`}
          points={[0, y, size.w, y]}
          stroke={isMajor ? "black" : "#bdbdbd"}
          strokeWidth={1}
          opacity={isMajor ? 0.18 : 0.22}
          listening={false}
        />
      );
      (isMajor ? hMajor : hMinor).push(node);
    }

    return { vMinor, hMinor, vMajor, hMajor };
  }, [size.w, size.h]);

  return (
    <Stage id="stage-main" width={size.w} height={size.h} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <Layer id="layer-main">
        <Rect id="bg" x={0} y={0} width={size.w} height={size.h} fill="#f7f7f7" listening={false} />

        {grid.vMinor}
        {grid.hMinor}
        {grid.vMajor}
        {grid.hMajor}

        {connections.map((c) => {
          const a = portMap[c.from];
          const b = portMap[c.to];
          if (!a || !b) return null;
          return <Line key={c.id} id={c.id} points={[a.x, a.y, b.x, b.y]} stroke="black" strokeWidth={3} />;
        })}

        {fromPortId && portMap[fromPortId] && (
          <Line
            id="wire-ghost"
            points={[
              portMap[fromPortId].x,
              portMap[fromPortId].y,
              hoverPortId && isValidTarget(fromPortId, hoverPortId) ? portMap[hoverPortId].x : pointer.x,
              hoverPortId && isValidTarget(fromPortId, hoverPortId) ? portMap[hoverPortId].y : pointer.y,
            ]}
            stroke="red"
            strokeWidth={3}
            dash={[10, 5]}
          />
        )}

        {gates.map((g) => (
          <Group
            key={g.id}
            id={g.id}
            x={g.x}
            y={g.y}
            draggable
            onDragMove={(e) => {
              const pos = e.target.position();
              updateGatePos(g.id, pos.x, pos.y);
            }}
            onDragEnd={(e) => {
              const pos = e.target.position();
              updateGatePos(g.id, pos.x, pos.y);
            }}
          >
            <Rect id={`${g.id}-body`} width={g.w} height={g.h} fill="white" stroke="black" />
            <Text id={`${g.id}-label`} text={g.type} x={g.type.length === 2 ? 48 : 40} y={20} fontSize={18} />

            {g.ports.map((p) => {
              const isSelectedOut = p.kind === "out" && fromPortId === p.id;
              const isTargetIn =
                p.kind === "in" && fromPortId && isValidTarget(fromPortId, p.id) && hoverPortId === p.id;

              return (
                <Circle
                  key={p.id}
                  id={p.id}
                  x={p.dx}
                  y={p.dy}
                  radius={6}
                  fill={isSelectedOut ? "red" : isTargetIn ? "green" : "black"}
                  onMouseDown={(e) => onPortMouseDown(e, p.id)}
                  onMouseEnter={() => onPortEnter(p.id)}
                  onMouseLeave={() => onPortLeave(p.id)}
                />
              );
            })}
          </Group>
        ))}
      </Layer>
    </Stage>
  );
}
