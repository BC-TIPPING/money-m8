
import LandingSection from "./index/LandingSection";
import AssessmentStepper from "./index/AssessmentStepper";
import { useAssessmentState } from "./index/assessmentHooks";

export default function Index() {
  const assessment = useAssessmentState();

  if (!assessment.showAssessment) {
    return (
      <LandingSection onStartAssessment={() => assessment.setShowAssessment(true)} />
    );
  }

  return (
    <AssessmentStepper {...assessment} />
  );
}
