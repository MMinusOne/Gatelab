"use client";

import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Group, Text, Circle, Line} from "react-konva";

export default function CanvasEditor() {
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [fromPort, setFromPort] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ from: string; to: string}[]>([]);
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
const click = (portId: string) => {
  const isOut = portId.includes("-out");
  const isIn = portId.includes("-in");
  if (!fromPort) {
    if (isOut) setFromPort(portId);
    return;
  }
  if (fromPort && isIn) {
    setConnections((prev) => [...prev, { from: fromPort, to: portId }]);
  }
  setFromPort(null);
};

 const AND_X = 100, AND_Y = 100;
const OR_X = 350, OR_Y = 100;

const portPos: Record<string, { x: number; y: number }> = {
  "AND-in1": { x: AND_X + 0,   y: AND_Y + 15 },
  "AND-in2": { x: AND_X + 0,   y: AND_Y + 40 },
  "AND-out": { x: AND_X + 110, y: AND_Y + 28 },

  "OR-in1":  { x: OR_X + 0,    y: OR_Y + 15 },
  "OR-in2":  { x: OR_X + 0,    y: OR_Y + 40 },
  "OR-out":  { x: OR_X + 110,  y: OR_Y + 28 },
};


  return (
    <Stage width={size.w} height={size.h}>
      <Layer>
        <Rect x={0} y={0} width={size.w} height={size.h} fill="#f5f5f5" />
        {connections.map((c, i) => (
  <Line
    key={i}
    points={[
      portPos[c.from].x,
      portPos[c.from].y,
      portPos[c.to].x,
      portPos[c.to].y,
    ]}
    stroke="black"
    strokeWidth={3}
  />
))}

        <Group x={100} y={100} draggable>
            <Rect 
            width={110}
            height={55}
            fill="white" 
            stroke="black"
            /> 
            <Circle x={0} y={15} radius={6} fill="red" onMouseDown={() => click("AND-in1")} />
            <Circle x={0} y={40} radius={6} fill="red" onMouseDown={() => click("AND-in2")} />
            <Circle x={110} y={28} radius={6} fill={fromPort === "AND-out" ? "red" : "black"}
 onMouseDown={() => click("AND-out")} />
            
         </Group>
                 <Group x={100} y={100} draggable>
            <Rect 
            width={110}
            height={55}
            fill="white" 
            stroke="black"
            /> 
            <Circle x={0} y={15} radius={6} fill="red" onMouseDown={() => click("OR-in1")} />
            <Circle x={0} y={40} radius={6} fill="red" onMouseDown={() => click("OR-in2")} />
            <Circle x={110} y={28} radius={6} fill={fromPort === "OR-out" ? "red" : "black"}
 onMouseDown={() => click("OR-out")} />
            
         </Group>
      </Layer>

    </Stage>
  );
}
