"use client";

import dynamic from "next/dynamic";
import SceneSlot from "./SceneSlot";

const StudyColumn = dynamic(() => import("./StudyColumn"), { ssr: false });

/** The DOM slot for /about's machined stack. See StudyColumn for the scene. */
export default function StudyStack({ done, total }) {
  return (
    <SceneSlot className="about__art" lead={0.85} run={0.9}>
      {({ progress, active }) => (
        <StudyColumn
          done={done}
          total={total}
          progress={progress}
          active={active}
        />
      )}
    </SceneSlot>
  );
}
