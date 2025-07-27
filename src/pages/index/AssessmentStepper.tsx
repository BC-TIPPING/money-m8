import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { questions, healthCheckQuestions, INCOME_FREQUENCIES, PRELOADED_INCOME_CATEGORIES, PRELOADED_EXPENSE_CATEGORIES, type DebtDetail } from "./assessmentHooks";
import AssessmentSummary from "./AssessmentSummary";
import FileAnalysisReport from "./FileAnalysisReport";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  hasRegularIncome: boolean | undefined;
  setHasRegularIncome: (hasRegular: boolean | undefined) => void;
  incomeSources: { category: string; amount: string; frequency: string }[];
  setIncomeSources: (sources: { category: string; amount: string; frequency: string }[]) => void;
  expenseItems: { category: string; amount: string; frequency: string }[];
  setExpenseItems: (items: { category: string; amount: string; frequency: string }[]) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any;
  postcode: string;
  setPostcode: (postcode: string) => void;
  age: number | undefined;
  setAge: (age: number | undefined) => void;
  superBalance: number | undefined;
  setSuperBalance: (balance: number | undefined) => void;
  insurances: string[];
  setInsurances: (insurances: string[]) => void;
}

export default function AssessmentStepper({
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
  hasRegularIncome,
  setHasRegularIncome,
  incomeSources,
  setIncomeSources,
  expenseItems,
  setExpenseItems,
  uploadedFile,
  setUploadedFile,
  fileInputRef,
  generateSummary,
  isGeneratingSummary,
  aiSummary,
  chartData,
  postcode,
  setPostcode,
  age,
  setAge,
  superBalance,
  setSuperBalance,
  insurances,
  setInsurances,
}: AssessmentStepperProps) {
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const processFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data, error } = await supabase.functions.invoke('process-statement', {
        body: formData,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('File processed successfully:', data);
      setAnalysisResult(data);
      toast.success("File processed successfully!");
    },
    onError: (error) => {
      console.error('File processing error:', error);
      toast.error("Error processing file. Please try again.");
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      processFileMutation.mutate(file);
    }
  };

  const handleNext = () => {
    const allQuestions = goals.includes('Full Financial Health Check') 
      ? [...questions, ...healthCheckQuestions] 
      : questions;
    
    if (step < allQuestions.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const allQuestions = goals.includes('Full Financial Health Check') 
    ? [...questions, ...healthCheckQuestions] 
    : questions;

  const currentQuestion = allQuestions[step];
  const isLastStep = step >= allQuestions.length;

  if (isLastStep) {
    return (
      <AssessmentSummary
        generateSummary={generateSummary}
        isGeneratingSummary={isGeneratingSummary}
      />
    );
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "income-list":
        return (
          <div className="space-y-4">
            {incomeSources.map((source, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor={`income-category-${index}`}>Income Source</Label>
                  <Select
                    value={source.category}
                    onValueChange={(value) => {
                      const newSources = [...incomeSources];
                      newSources[index] = { ...source, category: value };
                      setIncomeSources(newSources);
                    }}
                  >
                    <SelectTrigger id={`income-category-${index}`}>
                      <SelectValue placeholder="Select income source" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRELOADED_INCOME_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Label htmlFor={`income-amount-${index}`}>Amount ($)</Label>
                  <Input
                    id={`income-amount-${index}`}
                    type="number"
                    value={source.amount}
                    onChange={(e) => {
                      const newSources = [...incomeSources];
                      newSources[index] = { ...source, amount: e.target.value };
                      setIncomeSources(newSources);
                    }}
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`income-frequency-${index}`}>Frequency</Label>
                  <Select
                    value={source.frequency}
                    onValueChange={(value) => {
                      const newSources = [...incomeSources];
                      newSources[index] = { ...source, frequency: value };
                      setIncomeSources(newSources);
                    }}
                  >
                    <SelectTrigger id={`income-frequency-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newSources = incomeSources.filter((_, i) => i !== index);
                    setIncomeSources(newSources);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setIncomeSources([...incomeSources, { category: "", amount: "", frequency: "Monthly" }]);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income Source
            </Button>
          </div>
        );

      case "upload":
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Upload Bank Statement</p>
              <p className="text-gray-600 mb-4">
                Upload your bank statement (PDF, CSV, or Excel) to automatically categorize transactions
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={processFileMutation.isPending}
              >
                {processFileMutation.isPending ? "Processing..." : "Choose File"}
              </Button>
              {uploadedFile && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">{uploadedFile.name}</span>
                </div>
              )}
            </div>
            
            {analysisResult && (
              <div className="mt-6">
                <FileAnalysisReport result={analysisResult} />
              </div>
            )}
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">Or skip this step and enter manually</p>
              <Button variant="outline" onClick={handleNext}>
                Skip Upload
              </Button>
            </div>
          </div>
        );

      case "expense-list":
        return (
          <div className="space-y-4">
            {expenseItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor={`expense-category-${index}`}>{item.category}</Label>
                  <div className="text-sm text-gray-600 mb-2">
                    {item.category}
                  </div>
                </div>
                <div className="w-32">
                  <Label htmlFor={`expense-amount-${index}`}>Amount ($)</Label>
                  <Input
                    id={`expense-amount-${index}`}
                    type="number"
                    value={item.amount}
                    onChange={(e) => {
                      const newItems = [...expenseItems];
                      newItems[index] = { ...item, amount: e.target.value };
                      setExpenseItems(newItems);
                    }}
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`expense-frequency-${index}`}>Frequency</Label>
                  <Select
                    value={item.frequency}
                    onValueChange={(value) => {
                      const newItems = [...expenseItems];
                      newItems[index] = { ...item, frequency: value };
                      setExpenseItems(newItems);
                    }}
                  >
                    <SelectTrigger id={`expense-frequency-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {freq}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        const handleCheckboxChange = (option: string, checked: boolean) => {
          if (currentQuestion.id === "investmentExperience") {
            if (checked) {
              setInvestmentExperience([...investmentExperience, option]);
            } else {
              setInvestmentExperience(investmentExperience.filter(exp => exp !== option));
            }
          } else if (currentQuestion.id === "debtTypes") {
            if (checked) {
              setDebtTypes([...debtTypes, option]);
            } else {
              setDebtTypes(debtTypes.filter(type => type !== option));
            }
          } else if (currentQuestion.id === "insurances") {
            if (checked) {
              setInsurances([...insurances, option]);
            } else {
              setInsurances(insurances.filter(ins => ins !== option));
            }
          }
        };

        const getCheckedValues = () => {
          if (currentQuestion.id === "investmentExperience") return investmentExperience;
          if (currentQuestion.id === "debtTypes") return debtTypes;
          if (currentQuestion.id === "insurances") return insurances;
          return [];
        };

        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={getCheckedValues().includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                />
                <Label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "debt-details-list":
        return (
          <div className="space-y-4">
            {debtTypes.filter(type => type !== "No current debt").map((debtType, index) => {
              const existingDetail = debtDetails.find(d => d.type === debtType);
              return (
                <Card key={debtType}>
                  <CardHeader>
                    <CardTitle className="text-lg">{debtType}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${debtType}-loan-amount`}>Original Loan Amount ($)</Label>
                        <Input
                          id={`${debtType}-loan-amount`}
                          type="number"
                          value={existingDetail?.loanAmount || ""}
                          onChange={(e) => {
                            const newDetails = [...debtDetails];
                            const existingIndex = newDetails.findIndex(d => d.type === debtType);
                            if (existingIndex >= 0) {
                              newDetails[existingIndex] = { ...newDetails[existingIndex], loanAmount: e.target.value };
                            } else {
                              newDetails.push({
                                type: debtType,
                                loanAmount: e.target.value,
                                balance: "",
                                repayments: "",
                                repaymentFrequency: "Monthly",
                                interestRate: ""
                              });
                            }
                            setDebtDetails(newDetails);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${debtType}-balance`}>Current Balance ($)</Label>
                        <Input
                          id={`${debtType}-balance`}
                          type="number"
                          value={existingDetail?.balance || ""}
                          onChange={(e) => {
                            const newDetails = [...debtDetails];
                            const existingIndex = newDetails.findIndex(d => d.type === debtType);
                            if (existingIndex >= 0) {
                              newDetails[existingIndex] = { ...newDetails[existingIndex], balance: e.target.value };
                            } else {
                              newDetails.push({
                                type: debtType,
                                loanAmount: "",
                                balance: e.target.value,
                                repayments: "",
                                repaymentFrequency: "Monthly",
                                interestRate: ""
                              });
                            }
                            setDebtDetails(newDetails);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${debtType}-repayments`}>Monthly Repayments ($)</Label>
                        <Input
                          id={`${debtType}-repayments`}
                          type="number"
                          value={existingDetail?.repayments || ""}
                          onChange={(e) => {
                            const newDetails = [...debtDetails];
                            const existingIndex = newDetails.findIndex(d => d.type === debtType);
                            if (existingIndex >= 0) {
                              newDetails[existingIndex] = { ...newDetails[existingIndex], repayments: e.target.value };
                            } else {
                              newDetails.push({
                                type: debtType,
                                loanAmount: "",
                                balance: "",
                                repayments: e.target.value,
                                repaymentFrequency: "Monthly",
                                interestRate: ""
                              });
                            }
                            setDebtDetails(newDetails);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${debtType}-interest-rate`}>Interest Rate (%)</Label>
                        <Input
                          id={`${debtType}-interest-rate`}
                          type="number"
                          step="0.01"
                          value={existingDetail?.interestRate || ""}
                          onChange={(e) => {
                            const newDetails = [...debtDetails];
                            const existingIndex = newDetails.findIndex(d => d.type === debtType);
                            if (existingIndex >= 0) {
                              newDetails[existingIndex] = { ...newDetails[existingIndex], interestRate: e.target.value };
                            } else {
                              newDetails.push({
                                type: debtType,
                                loanAmount: "",
                                balance: "",
                                repayments: "",
                                repaymentFrequency: "Monthly",
                                interestRate: e.target.value
                              });
                            }
                            setDebtDetails(newDetails);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );

      case "text":
        if (currentQuestion.id === "postcode") {
          return (
            <div className="space-y-4">
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter your postcode"
              />
            </div>
          );
        }
        break;

      case "number":
        if (currentQuestion.id === "age") {
          return (
            <div className="space-y-4">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age || ""}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter your age"
              />
            </div>
          );
        }
        if (currentQuestion.id === "superBalance") {
          return (
            <div className="space-y-4">
              <Label htmlFor="superBalance">Current Super Balance ($)</Label>
              <Input
                id="superBalance"
                type="number"
                value={superBalance || ""}
                onChange={(e) => setSuperBalance(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Enter your super balance"
              />
            </div>
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-8">
        <Progress value={(step / allQuestions.length) * 100} className="mb-4" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {step + 1} of {allQuestions.length}</span>
          <span>{Math.round((step / allQuestions.length) * 100)}% Complete</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.title}</CardTitle>
          <CardDescription>{currentQuestion.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderQuestion()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handleBack} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={handleNext}>
          {step === allQuestions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
