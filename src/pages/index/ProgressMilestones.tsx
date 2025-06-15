
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProgressMilestonesProps {
  progress: number;
  step: number;
  total: number;
  milestones: string[];
  currentMilestoneIdx: number;
}

const ProgressMilestones: React.FC<ProgressMilestonesProps> = ({
  progress,
  step,
  total,
  milestones,
  currentMilestoneIdx,
}) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
      <span className="text-sm text-gray-500">{step + 1} of {total}</span>
    </div>
    <Progress value={progress} className="h-2" />
    <div className="flex flex-row flex-wrap justify-between mt-2 w-full">
      {milestones.map((goal, idx) => (
        <span
          key={goal + idx}
          className={
            "text-[10px] md:text-xs text-gray-400 transition-all " +
            (currentMilestoneIdx === idx
              ? "font-bold text-blue-600 scale-110"
              : "")
          }
          style={{ maxWidth: "max(8%,80px)" }}
          title={goal}
        >
          {goal}
        </span>
      ))}
    </div>
  </div>
);

export default ProgressMilestones;
