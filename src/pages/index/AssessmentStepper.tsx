import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { questions, healthCheckQuestions, INCOME_FREQUENCIES, type DebtDetail } from "./assessmentHooks";
import AssessmentSummary from "./AssessmentSummary";
import FileAnalysisReport from "./FileAnalysisReport";

export interface AssessmentStepperProps {
  step: number;
  setStep: (step: number) => void;
  showAssessment: boolean;
  setShowAssessment: (show: boolean) => void;
  goals: string[];
  setGoals: (goals: string[]) => void;
  otherGoal: string;
  setOtherGoal: (goal: string) => void;
  debtTypes: string[];
  setDebtTypes: (types: string[]) => void;
  debtDetails: DebtDetail[];
  setDebtDetails: (details: DebtDetail[]) => void;
  investmentExperience: string[];
  setInvestmentExperience: (experience: string[]) => void;
  incomeSources: { category: string; amount: string; frequency: string }[];
  setIncomeSources: (sources: { category: string; amount: string; frequency: string }[]) => void;
  expenseItems: { category: string; amount: string; frequency: string }[];
  setExpenseItems: (items: { category: string; amount: string; frequency: string }[]) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  postcode: string;
  setPostcode: (postcode: string) => void;
  age: number | undefined;
  setAge: (age: number | undefined) => void;
  superBalance: number | undefined;
  setSuperBalance: (balance: number | undefined) => void;
  insurances: string[];
  setInsurances: (insurances: string[]) => void;
  assets: { type: string; value: string; description: string }[];
  setAssets: (assets: { type: string; value: string; description: string }[]) => void;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any;
}

const AssessmentStepper: React.FC<AssessmentStepperProps> = ({
  step,
  setStep,
  showAssessment,
  setShowAssessment,
  goals,
  setGoals,
  otherGoal,
  setOtherGoal,
  debtTypes,
  setDebtTypes,
  debtDetails,
  setDebtDetails,
  investmentExperience,
  setInvestmentExperience,
  incomeSources,
  setIncomeSources,
  expenseItems,
  setExpenseItems,
  uploadedFile,
  setUploadedFile,
  fileInputRef,
  postcode,
  setPostcode,
  age,
  setAge,
  superBalance,
  setSuperBalance,
  insurances,
  setInsurances,
  assets,
  setAssets,
  generateSummary,
  isGeneratingSummary,
  aiSummary,
  chartData,
}) => {
  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleNext = () => {
    if (step < questions.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (goals.includes(value)) {
      setGoals(goals.filter((goal) => goal !== value));
    } else {
      setGoals([...goals, value]);
    }
  };

  const handleOtherGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherGoal(e.target.value);
  };

  const handleDebtTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (debtTypes.includes(value)) {
      setDebtTypes(debtTypes.filter((type) => type !== value));
    } else {
      setDebtTypes([...debtTypes, value]);
    }
  };

  const handleInvestmentExperienceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    if (investmentExperience.includes(value)) {
      setInvestmentExperience(
        investmentExperience.filter((exp) => exp !== value)
      );
    } else {
      setInvestmentExperience([...investmentExperience, value]);
    }
  };

  const handleIncomeSourceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newIncomeSources = [...incomeSources];
    newIncomeSources[index][field] = value;
    setIncomeSources(newIncomeSources);
  };

  const handleAddIncomeSource = () => {
    setIncomeSources([
      ...incomeSources,
      { category: "", amount: "", frequency: "Monthly" },
    ]);
  };

  const handleRemoveIncomeSource = (index: number) => {
    const newIncomeSources = [...incomeSources];
    newIncomeSources.splice(index, 1);
    setIncomeSources(newIncomeSources);
  };

  const handleExpenseItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newExpenseItems = [...expenseItems];
    newExpenseItems[index][field] = value;
    setExpenseItems(newExpenseItems);
  };

  const handleDebtDetailChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newDebtDetails = [...debtDetails];
    newDebtDetails[index][field] = value;
    setDebtDetails(newDebtDetails);
  };

  const handleAddDebtDetail = () => {
    setDebtDetails([
      ...debtDetails,
      {
        type: "",
        loanAmount: "",
        balance: "",
        repayments: "",
        repaymentFrequency: "",
        interestRate: "",
      },
    ]);
  };

  const handleRemoveDebtDetail = (index: number) => {
    const newDebtDetails = [...debtDetails];
    newDebtDetails.splice(index, 1);
    setDebtDetails(newDebtDetails);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostcode(e.target.value);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAge(value === "" ? undefined : parseInt(value, 10));
  };

  const handleSuperBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSuperBalance(value === "" ? undefined : parseInt(value, 10));
  };

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (insurances.includes(value)) {
      setInsurances(insurances.filter((insurance) => insurance !== value));
    } else {
      setInsurances([...insurances, value]);
    }
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.id) {
      case "incomeSources":
        return (
          <div>
            {incomeSources.map((source, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>Income Source #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`income-category-${index}`}>Category</Label>
                    <Input
                      type="text"
                      id={`income-category-${index}`}
                      value={source.category}
                      onChange={(e) =>
                        handleIncomeSourceChange(index, "category", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`income-amount-${index}`}>Amount</Label>
                    <Input
                      type="number"
                      id={`income-amount-${index}`}
                      value={source.amount}
                      onChange={(e) =>
                        handleIncomeSourceChange(index, "amount", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`income-frequency-${index}`}>Frequency</Label>
                    <Select
                      value={source.frequency}
                      onValueChange={(value) =>
                        handleIncomeSourceChange(index, "frequency", value)
                      }
                    >
                      <SelectTrigger id={`income-frequency-${index}`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveIncomeSource(index)}
                >
                  Remove
                </Button>
              </Card>
            ))}
            <Button onClick={handleAddIncomeSource}>Add Income Source</Button>
          </div>
        );
      case "upload":
        return (
          <div>
            <input
              type="file"
              accept=".pdf,.csv,.xls,.xlsx"
              onChange={handleFileChange}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Upload File
            </Button>
            {uploadedFile && <FileAnalysisReport file={uploadedFile} />}
          </div>
        );
      case "expenses":
        return (
          <div>
            {expenseItems.map((item, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>{item.category}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`expense-amount-${index}`}>Amount</Label>
                    <Input
                      type="number"
                      id={`expense-amount-${index}`}
                      value={item.amount}
                      onChange={(e) =>
                        handleExpenseItemChange(index, "amount", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`expense-frequency-${index}`}>Frequency</Label>
                    <Select
                      value={item.frequency}
                      onValueChange={(value) =>
                        handleExpenseItemChange(index, "frequency", value)
                      }
                    >
                      <SelectTrigger id={`expense-frequency-${index}`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      case "investmentExperience":
        return (
          <div className="grid gap-2">
            {currentQuestion.options?.map((option) => (
              <div className="flex items-center space-x-2" key={option}>
                <Checkbox
                  id={option}
                  value={option}
                  checked={investmentExperience.includes(option)}
                  onCheckedChange={() => {
                    if (investmentExperience.includes(option)) {
                      setInvestmentExperience(
                        investmentExperience.filter((exp) => exp !== option)
                      );
                    } else {
                      setInvestmentExperience([...investmentExperience, option]);
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case "debtTypes":
        return (
          <div className="grid gap-2">
            {currentQuestion.options?.map((option) => (
              <div className="flex items-center space-x-2" key={option}>
                <Checkbox
                  id={option}
                  value={option}
                  checked={debtTypes.includes(option)}
                  onCheckedChange={() => {
                    if (debtTypes.includes(option)) {
                      setDebtTypes(debtTypes.filter((type) => type !== option));
                    } else {
                      setDebtTypes([...debtTypes, option]);
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      case "debtDetails":
        return (
          <div>
            {debtDetails.map((detail, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>Debt #{index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-type-${index}`}>Type</Label>
                    <Input
                      type="text"
                      id={`debt-type-${index}`}
                      value={detail.type}
                      onChange={(e) =>
                        handleDebtDetailChange(index, "type", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-loanAmount-${index}`}>Loan Amount</Label>
                    <Input
                      type="number"
                      id={`debt-loanAmount-${index}`}
                      value={detail.loanAmount}
                      onChange={(e) =>
                        handleDebtDetailChange(index, "loanAmount", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-balance-${index}`}>Balance</Label>
                    <Input
                      type="number"
                      id={`debt-balance-${index}`}
                      value={detail.balance}
                      onChange={(e) =>
                        handleDebtDetailChange(index, "balance", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-repayments-${index}`}>Repayments</Label>
                    <Input
                      type="number"
                      id={`debt-repayments-${index}`}
                      value={detail.repayments}
                      onChange={(e) =>
                        handleDebtDetailChange(index, "repayments", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-repaymentFrequency-${index}`}>
                      Repayment Frequency
                    </Label>
                    <Select
                      value={detail.repaymentFrequency}
                      onValueChange={(value) =>
                        handleDebtDetailChange(index, "repaymentFrequency", value)
                      }
                    >
                      <SelectTrigger id={`debt-repaymentFrequency-${index}`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency}>
                            {frequency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`debt-interestRate-${index}`}>
                      Interest Rate
                    </Label>
                    <Input
                      type="number"
                      id={`debt-interestRate-${index}`}
                      value={detail.interestRate}
                      onChange={(e) =>
                        handleDebtDetailChange(index, "interestRate", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveDebtDetail(index)}
                >
                  Remove
                </Button>
              </Card>
            ))}
            <Button onClick={handleAddDebtDetail}>Add Debt</Button>
          </div>
        );
      case "postcode":
        return (
          <div className="grid gap-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              type="text"
              id="postcode"
              value={postcode}
              onChange={handlePostcodeChange}
            />
          </div>
        );
      case "age":
        return (
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              type="number"
              id="age"
              value={age === undefined ? "" : age.toString()}
              onChange={handleAgeChange}
            />
          </div>
        );
      case "superBalance":
        return (
          <div className="grid gap-2">
            <Label htmlFor="superBalance">Superannuation Balance</Label>
            <Input
              type="number"
              id="superBalance"
              value={superBalance === undefined ? "" : superBalance.toString()}
              onChange={handleSuperBalanceChange}
            />
          </div>
        );
      case "insurances":
        return (
          <div className="grid gap-2">
            {healthCheckQuestions
              .find((q) => q.id === "insurances")
              ?.options?.map((option) => (
                <div className="flex items-center space-x-2" key={option}>
                  <Checkbox
                    id={option}
                    value={option}
                    checked={insurances.includes(option)}
                    onCheckedChange={() => {
                      if (insurances.includes(option)) {
                        setInsurances(insurances.filter((ins) => ins !== option));
                      } else {
                        setInsurances([...insurances, option]);
                      }
                    }}
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
          </div>
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderHealthCheckQuestions = () => {
    if (!goals.includes("Full Financial Health Check")) {
      return null;
    }

    const healthCheckStep = step - questions.length;

    if (healthCheckStep >= 0 && healthCheckStep < healthCheckQuestions.length) {
      const currentHealthCheckQuestion = healthCheckQuestions[healthCheckStep];

      switch (currentHealthCheckQuestion.id) {
        case "postcode":
          return (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{currentHealthCheckQuestion.title}</CardTitle>
                <CardDescription>
                  {currentHealthCheckQuestion.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    type="text"
                    id="postcode"
                    value={postcode}
                    onChange={handlePostcodeChange}
                  />
                </div>
              </CardContent>
            </Card>
          );
        case "age":
          return (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{currentHealthCheckQuestion.title}</CardTitle>
                <CardDescription>
                  {currentHealthCheckQuestion.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    type="number"
                    id="age"
                    value={age === undefined ? "" : age.toString()}
                    onChange={handleAgeChange}
                  />
                </div>
              </CardContent>
            </Card>
          );
        case "superBalance":
          return (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{currentHealthCheckQuestion.title}</CardTitle>
                <CardDescription>
                  {currentHealthCheckQuestion.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <Label htmlFor="superBalance">Superannuation Balance</Label>
                  <Input
                    type="number"
                    id="superBalance"
                    value={superBalance === undefined ? "" : superBalance.toString()}
                    onChange={handleSuperBalanceChange}
                  />
                </div>
              </CardContent>
            </Card>
          );
        case "insurances":
          return (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>{currentHealthCheckQuestion.title}</CardTitle>
                <CardDescription>
                  {currentHealthCheckQuestion.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {healthCheckQuestions
                    .find((q) => q.id === "insurances")
                    ?.options?.map((option) => (
                      <div className="flex items-center space-x-2" key={option}>
                        <Checkbox
                          id={option}
                          value={option}
                          checked={insurances.includes(option)}
                          onCheckedChange={() => {
                            if (insurances.includes(option)) {
                              setInsurances(
                                insurances.filter((ins) => ins !== option)
                              );
                            } else {
                              setInsurances([...insurances, option]);
                            }
                          }}
                        />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        default:
          return <div>Unknown health check question type</div>;
      }
    }

    return null;
  };

  const totalQuestions =
    questions.length +
    (goals.includes("Full Financial Health Check") ? healthCheckQuestions.length : 0);
  const currentStep = step + 1;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Progress value={progress} className="mb-4" />
      <div className="text-sm font-medium text-muted-foreground text-center mb-4">
        Step {currentStep} of {totalQuestions}
      </div>

      {!showAssessment ? (
        <Card>
          <CardHeader>
            <CardTitle>What are your financial goals?</CardTitle>
            <CardDescription>
              Select the goals that are most important to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="buy-house"
                  value="Buy a house"
                  checked={goals.includes("Buy a house")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="buy-house">Buy a house</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="buy-investment-property"
                  value="Buy an investment property"
                  checked={goals.includes("Buy an investment property")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="buy-investment-property">
                  Buy an investment property
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pay-off-home-loan-sooner"
                  value="Pay off home loan sooner"
                  checked={goals.includes("Pay off home loan sooner")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="pay-off-home-loan-sooner">
                  Pay off home loan sooner
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maximise-super"
                  value="Maximise super"
                  checked={goals.includes("Maximise super")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="maximise-super">Maximise super</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="set-budget"
                  value="Set a budget"
                  checked={goals.includes("Set a budget")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="set-budget">Set a budget</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reduce-debt"
                  value="Reduce debt"
                  checked={goals.includes("Reduce debt")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="reduce-debt">Reduce debt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grow-investments"
                  value="Grow investments"
                  checked={goals.includes("Grow investments")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="grow-investments">Grow investments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="full-financial-health-check"
                  value="Full Financial Health Check"
                  checked={goals.includes("Full Financial Health Check")}
                  onCheckedChange={handleGoalChange}
                />
                <Label htmlFor="full-financial-health-check">
                  Full Financial Health Check
                </Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="other-goal">Other Goal</Label>
              <Input
                type="text"
                id="other-goal"
                placeholder="Enter your goal"
                value={otherGoal}
                onChange={handleOtherGoalChange}
              />
            </div>
          </CardContent>
          <Button onClick={() => setShowAssessment(true)}>Start Assessment</Button>
        </Card>
      ) : (
        <>
          {step < questions.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentQuestion.title}</CardTitle>
                <CardDescription>{currentQuestion.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>{renderQuestionContent()}</CardContent>
            </Card>
          ) : null}

          {renderHealthCheckQuestions()}

          {step < questions.length + healthCheckQuestions.length &&
            goals.includes("Full Financial Health Check") ? (
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 0}>
                Back
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          ) : null}

          {step === questions.length + healthCheckQuestions.length &&
            goals.includes("Full Financial Health Check") ? (
            <AssessmentSummary
              aiSummary={aiSummary}
              chartData={chartData}
              isGeneratingSummary={isGeneratingSummary}
              generateSummary={generateSummary}
            />
          ) : null}
        </>
      )}
      {isGeneratingSummary && (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <p>Generating summary...</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentStepper;
