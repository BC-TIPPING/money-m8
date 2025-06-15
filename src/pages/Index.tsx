
import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState } from "./index/assessmentHooks";

export default function Index() {
  const assessment = useAssessmentState();

  const handleStartAssessment = (goal: string) => {
    assessment.setGoals([goal]);
    assessment.setShowAssessment(true);
  };

  if (!assessment.showAssessment) {
    return (
      <LandingSection onStartAssessment={handleStartAssessment} />
    );
  }

  return (
    <AssessmentStepper {...assessment} />
  );
}
