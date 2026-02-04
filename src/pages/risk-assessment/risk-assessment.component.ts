import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IClinicalInput,
  ClinicalPredictionDto,
  IFeatureImpact,
} from '../../dto/Clinical-prediction.dto';
import { ScaInferenceService } from '../../services/sca-inference.service';

// Interface for form data
interface RiskAssessmentFormData {
  // Demographics
  age: number | null;
  sex: string;
  chestPainType: string;

  // Vitals & Blood Tests
  bloodPressure: number | null;
  cholesterol: number | null;
  fbs: boolean | null;
  restecg: string;

  // Cardiac Tests
  maxHeartRate: number | null;
  exang: boolean | null;
  stDepression: number | null;
  slope: string;
  majorVessels: number | null;
  thalassemia: string;
}

// Interface for dropdown options
interface SelectOption {
  value: string | number;
  label: string;
}

// Interface for chip button options
interface ChipOption {
  value: string;
  label: string;
}

// Simplified interface for display
interface DisplayFeature {
  key: string;
  value: number;
  impact: string;
  shap_value: number;
}

// Interface for API Response
interface ApiResponse {
  operation: string;
  record: {
    PatientID: string;
    ClinicalData: any;
    ClinicalPrediction: {
      Prediction: number;
      PredictionText: string;
      DiseaseProb: number;
    };
    XAI: {
      AllFeatures: Record<string, {
        impact: string;
        shap_value: number;
        value: number;
      }>;
      FeatureImportance: Record<string, {
        impact: string;
        shap_value: number;
        value: number;
      }>;
    };
    FinalDecision: string;
    CreatedAt: string;
  };
}

@Component({
  selector: 'app-risk-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-assessment.component.html',
  styleUrl: './risk-assessment.component.scss',
})
export class RiskAssessmentComponent implements OnInit {
  // Step management
  currentStep: number = 1;
  totalSteps: number = 3;
  progressPercentage: number = 0;

  // Loading and prediction result
  loading: boolean = false;
  predictionResult?: ClinicalPredictionDto;
  showAllFeatures: boolean = false;

  // Form data
  formData: RiskAssessmentFormData = {
    age: null,
    sex: '',
    chestPainType: '',
    bloodPressure: null,
    cholesterol: null,
    fbs: null,
    restecg: '',
    maxHeartRate: null,
    exang: null,
    stDepression: null,
    slope: '',
    majorVessels: null,
    thalassemia: '',
  };

  // Dropdown options
  sexOptions: SelectOption[] = [
    { value: '', label: 'Select sex' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  slopeOptions: SelectOption[] = [
    { value: '', label: 'Select slope' },
    { value: 'up', label: 'Upsloping' },
    { value: 'flat', label: 'Flat' },
    { value: 'down', label: 'Downsloping' },
  ];

  majorVesselsOptions: SelectOption[] = [
    { value: '', label: 'Select number' },
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
  ];

  thalassemiaOptions: SelectOption[] = [
    { value: '', label: 'Select type' },
    { value: 'normal', label: 'Normal' },
    { value: 'fixed', label: 'Fixed Defect' },
    { value: 'reversible', label: 'Reversible Defect' },
  ];

  // Chip button options
  chestPainTypes: ChipOption[] = [
    { value: 'typical', label: 'Typical Angina' },
    { value: 'atypical', label: 'Atypical Angina' },
    { value: 'non-anginal', label: 'Non-anginal' },
    { value: 'asymptomatic', label: 'Asymptomatic' },
  ];

  restecgTypes: ChipOption[] = [
    { value: 'normal', label: '✓ Normal' },
    { value: 'stt', label: '~ ST-T Abnormality' },
    { value: 'lvh', label: '! LV Hypertrophy' },
  ];

  constructor(
    private scaService: ScaInferenceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateProgress();
    this.scrollToTop();
  }

  // ==================== Navigation Methods ====================

  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) {
      return;
    }

    if (step > this.currentStep && !this.validateCurrentStep()) {
      return;
    }

    this.currentStep = step;
    this.updateProgress();
    this.scrollToTop();
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  updateProgress(): void {
    this.progressPercentage =
      ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==================== Step Status Methods ====================

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }

  isStepVisible(step: number): boolean {
    return this.currentStep === step;
  }

  // ==================== Chip Selection Methods ====================

  selectChestPainType(value: string): void {
    this.formData.chestPainType = value;
  }

  isChestPainTypeSelected(value: string): boolean {
    return this.formData.chestPainType === value;
  }

  selectRestecg(value: string): void {
    this.formData.restecg = value;
  }

  isRestecgSelected(value: string): boolean {
    return this.formData.restecg === value;
  }

  // ==================== Validation Methods ====================

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      default:
        return true;
    }
  }

  validateStep1(): boolean {
    if (!this.formData.age) {
      this.showValidationError('Please enter your age');
      return false;
    }

    if (this.formData.age < 1 || this.formData.age > 120) {
      this.showValidationError('Please enter a valid age (1-120 years)');
      return false;
    }

    if (!this.formData.sex) {
      this.showValidationError('Please select sex');
      return false;
    }

    if (!this.formData.chestPainType) {
      this.showValidationError('Please select chest pain type');
      return false;
    }

    return true;
  }

  validateStep2(): boolean {
    if (!this.formData.bloodPressure) {
      this.showValidationError('Please enter resting blood pressure');
      return false;
    }

    if (this.formData.bloodPressure < 50 || this.formData.bloodPressure > 250) {
      this.showValidationError(
        'Please enter a valid blood pressure (50-250 mm Hg)'
      );
      return false;
    }

    if (!this.formData.cholesterol) {
      this.showValidationError('Please enter serum cholesterol level');
      return false;
    }

    if (this.formData.cholesterol < 100 || this.formData.cholesterol > 600) {
      this.showValidationError(
        'Please enter a valid cholesterol level (100-600 mg/dl)'
      );
      return false;
    }

    if (this.formData.fbs === null) {
      this.showValidationError('Please select fasting blood sugar status');
      return false;
    }

    if (!this.formData.restecg) {
      this.showValidationError('Please select resting ECG result');
      return false;
    }

    return true;
  }

  validateStep3(): boolean {
    if (!this.formData.maxHeartRate) {
      this.showValidationError('Please enter maximum heart rate');
      return false;
    }

    if (this.formData.maxHeartRate < 60 || this.formData.maxHeartRate > 220) {
      this.showValidationError(
        'Please enter a valid max heart rate (60-220 bpm)'
      );
      return false;
    }

    if (this.formData.exang === null) {
      this.showValidationError('Please select exercise induced angina status');
      return false;
    }

    if (this.formData.stDepression === null) {
      this.showValidationError('Please enter ST depression value');
      return false;
    }

    if (this.formData.stDepression < 0 || this.formData.stDepression > 10) {
      this.showValidationError('Please enter a valid ST depression (0-10)');
      return false;
    }

    if (!this.formData.slope) {
      this.showValidationError('Please select ST slope');
      return false;
    }

    if (this.formData.majorVessels === null) {
      this.showValidationError('Please select number of major vessels');
      return false;
    }

    if (!this.formData.thalassemia) {
      this.showValidationError('Please select thalassemia type');
      return false;
    }

    return true;
  }

  showValidationError(message: string): void {
    alert(message);
  }

  // ==================== Form Submission ====================

  submitAssessment(): void {
    if (
      !this.validateStep1() ||
      !this.validateStep2() ||
      !this.validateStep3()
    ) {
      this.showValidationError('Please complete all required fields');
      return;
    }

    const payload: IClinicalInput = this.mapToClinicalDto();

    console.log('Submitting clinical assessment...');
    console.log('Payload:', payload);

    this.loading = true;
    this.predictionResult = undefined;

    this.scaService.predictClinical(payload).subscribe({
      next: (response) => {
        this.loading = false;
        
        console.log('Raw API Response:', response);
        
        // Transform the API response to match our DTO structure
        const apiResponse = response.body as any;
        
        if (apiResponse && apiResponse.record) {
          const record = apiResponse.record;
          
          // Map the nested response to the expected DTO format
          this.predictionResult = new ClinicalPredictionDto(
            record.ClinicalPrediction.Prediction,
            record.ClinicalPrediction.PredictionText,
            {
              disease: record.ClinicalPrediction.DiseaseProb,
              no_disease: 1 - record.ClinicalPrediction.DiseaseProb
            },
            this.transformFeatures(record.XAI.FeatureImportance),
            this.transformFeatures(record.XAI.AllFeatures)
          );

          console.log('Transformed Prediction Result:', this.predictionResult);

          // Scroll to result after a short delay
          setTimeout(() => {
            const resultElement = document.querySelector('.result-container');
            if (resultElement) {
              resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        } else {
          console.error('Unexpected response format:', response);
          alert('Received unexpected response format from server');
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Clinical prediction error:', error);

        let errorMessage = 'Clinical prediction failed. Please try again.';
        
        if (error.status === 400) {
          errorMessage = 'Invalid data submitted. Please check your inputs.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        }

        alert(errorMessage);
      },
    });
  }

  // Transform API feature format to DTO format
  private transformFeatures(features: Record<string, any>): Record<string, IFeatureImpact> {
    const transformed: Record<string, IFeatureImpact> = {};
    
    if (features) {
      Object.keys(features).forEach(key => {
        transformed[key] = {
          value: features[key].value,
          shap_value: features[key].shap_value,
          impact: features[key].impact
        };
      });
    }
    
    return transformed;
  }

  // ==================== XAI Display Methods ====================

  getTopFeatures(): DisplayFeature[] {
    if (!this.predictionResult?.feature_importance) {
      return [];
    }

    const features = Object.entries(this.predictionResult.feature_importance).map(
      ([key, feature]) => ({
        key,
        value: feature.value ?? 0,
        impact: feature.impact ?? '',
        shap_value: feature.shap_value ?? 0,
      })
    );

    // Sort by absolute SHAP value and take top 5
    return features
      .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
      .slice(0, 5);
  }

  getAllFeaturesSorted(): DisplayFeature[] {
    if (!this.predictionResult?.all_features) {
      return [];
    }

    const features = Object.entries(this.predictionResult.all_features).map(
      ([key, feature]) => ({
        key,
        value: feature.value ?? 0,
        impact: feature.impact ?? '',
        shap_value: feature.shap_value ?? 0,
      })
    );

    // Sort by absolute SHAP value
    return features.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  }

  getAllFeaturesCount(): number {
    return this.predictionResult?.all_features 
      ? Object.keys(this.predictionResult.all_features).length 
      : 0;
  }

  toggleAllFeatures(): void {
    this.showAllFeatures = !this.showAllFeatures;
  }

  getFeatureBarWidth(shapValue: number): number {
    if (!this.predictionResult?.feature_importance) return 0;
    
    const maxShap = Math.max(
      ...Object.values(this.predictionResult.feature_importance).map(f => Math.abs(f.shap_value ?? 0))
    );
    
    return maxShap > 0 ? (Math.abs(shapValue) / maxShap) * 100 : 0;
  }

  getShapBarWidth(shapValue: number): number {
    if (!this.predictionResult?.all_features) return 0;
    
    const maxShap = Math.max(
      ...Object.values(this.predictionResult.all_features).map(f => Math.abs(f.shap_value ?? 0))
    );
    
    return maxShap > 0 ? (Math.abs(shapValue) / maxShap) * 100 : 0;
  }

  getFeatureDisplayName(key: string): string {
    const nameMap: { [key: string]: string } = {
      age: 'Age',
      sex: 'Sex',
      cp: 'Chest Pain Type',
      trestbps: 'Resting Blood Pressure',
      chol: 'Cholesterol',
      fbs: 'Fasting Blood Sugar',
      restecg: 'Resting ECG',
      thalach: 'Max Heart Rate',
      exang: 'Exercise Induced Angina',
      oldpeak: 'ST Depression',
      slope: 'ST Slope',
      ca: 'Major Vessels',
      thal: 'Thalassemia',
    };
    return nameMap[key] || key;
  }

  getFeatureIcon(key: string): string {
    const iconMap: { [key: string]: string } = {
      age: '👤',
      sex: '⚧',
      cp: '💔',
      trestbps: '❤️',
      chol: '💧',
      fbs: '⚡',
      restecg: '📊',
      thalach: '💓',
      exang: '🏃',
      oldpeak: '📉',
      slope: '📈',
      ca: '🩸',
      thal: '🧬',
    };
    return iconMap[key] || '📋';
  }

  // New method to format feature values for display
  formatFeatureValue(key: string, value: number): string {
    // Format boolean-like values
    if (key === 'sex') {
      return value === 1 ? 'Male' : 'Female';
    }
    if (key === 'fbs' || key === 'exang') {
      return value === 1 ? 'Yes' : 'No';
    }
    
    // Format chest pain type
    if (key === 'cp') {
      const cpMap: { [key: number]: string } = {
        0: 'Typical Angina',
        1: 'Atypical Angina',
        2: 'Non-anginal',
        3: 'Asymptomatic'
      };
      return cpMap[value] || value.toString();
    }
    
    // Format resting ECG
    if (key === 'restecg') {
      const ecgMap: { [key: number]: string } = {
        0: 'Normal',
        1: 'ST-T Abnormality',
        2: 'LV Hypertrophy'
      };
      return ecgMap[value] || value.toString();
    }
    
    // Format slope
    if (key === 'slope') {
      const slopeMap: { [key: number]: string } = {
        0: 'Upsloping',
        1: 'Flat',
        2: 'Downsloping'
      };
      return slopeMap[value] || value.toString();
    }
    
    // Format thalassemia
    if (key === 'thal') {
      const thalMap: { [key: number]: string } = {
        1: 'Normal',
        2: 'Fixed Defect',
        3: 'Reversible Defect'
      };
      return thalMap[value] || value.toString();
    }
    
    // For numeric values, return with appropriate precision
    if (key === 'oldpeak') {
      return value.toFixed(1);
    }
    
    return Math.round(value).toString();
  }

  // New method to get factor card class
  getFactorCardClass(feature: DisplayFeature): string {
    return feature.impact === 'Increases' ? 'factor-increases' : 'factor-decreases';
  }

  // New method to get impact class
  getImpactClass(impact: string): string {
    return impact === 'Increases' ? 'impact-negative' : 'impact-positive';
  }

  getClinicalInterpretation(): string {
    if (!this.predictionResult) return '';

    const prediction = this.predictionResult.prediction ?? 0;
    const diseaseProb = ((this.predictionResult.probability?.disease ?? 0) * 100).toFixed(2);
    
    if (prediction === 0) {
      return `Based on the clinical data provided, the AI model predicts a low risk of Sudden Cardiac Arrest (SCA) with a disease probability of ${diseaseProb}%. The analysis indicates that several protective factors are present, including favorable cardiac parameters. However, continuous monitoring and regular follow-ups are recommended to maintain cardiovascular health.`;
    } else {
      return `Based on the clinical data provided, the AI model predicts an elevated risk of Sudden Cardiac Arrest (SCA) with a disease probability of ${diseaseProb}%. Several risk factors have been identified that contribute to this assessment. Immediate consultation with a cardiologist is strongly recommended for comprehensive evaluation and potential intervention strategies.`;
    }
  }

  // ==================== Result Display Methods ====================

  getRiskLevelClass(): string {
    if (!this.predictionResult) return '';
    
    const prediction = this.predictionResult.prediction ?? 0;
    return prediction === 1 ? 'high-risk' : 'low-risk';
  }

  getRiskIcon(): string {
    if (!this.predictionResult) return '🏥';
    
    const prediction = this.predictionResult.prediction ?? 0;
    return prediction === 1 ? '⚠️' : '✅';
  }

  getFinalDecisionText(): string {
    if (!this.predictionResult) return '';
    
    const prediction = this.predictionResult.prediction ?? 0;
    return prediction === 1 ? 'HIGH RISK' : 'LOW RISK';
  }

  // ==================== Action Methods ====================

  downloadReport(): void {
    if (!this.predictionResult) return;

    // Create a comprehensive report
    const report = {
      assessmentDate: new Date().toISOString(),
      patientData: {
        age: this.formData.age,
        sex: this.formData.sex,
        chestPainType: this.formData.chestPainType,
        bloodPressure: this.formData.bloodPressure,
        cholesterol: this.formData.cholesterol,
        fbs: this.formData.fbs,
        restecg: this.formData.restecg,
        maxHeartRate: this.formData.maxHeartRate,
        exang: this.formData.exang,
        stDepression: this.formData.stDepression,
        slope: this.formData.slope,
        majorVessels: this.formData.majorVessels,
        thalassemia: this.formData.thalassemia
      },
      prediction: {
        result: this.predictionResult.prediction_text,
        diseaseProb: this.predictionResult.probability?.disease,
        noDiseaseProb: this.predictionResult.probability?.no_disease,
        interpretation: this.getClinicalInterpretation()
      },
      topFeatures: this.getTopFeatures(),
      allFeatures: this.predictionResult.all_features
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sca-risk-assessment-${new Date().getTime()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ==================== Mapping Methods ====================

  mapToClinicalDto(): IClinicalInput {
    return {
      age: this.formData.age!,
      sex: this.mapSex(this.formData.sex),
      cp: this.mapChestPain(this.formData.chestPainType),
      trestbps: this.formData.bloodPressure!,
      chol: this.formData.cholesterol!,
      fbs: this.formData.fbs ? 1 : 0,
      restecg: this.mapRestEcg(this.formData.restecg),
      thalach: this.formData.maxHeartRate!,
      exang: this.formData.exang ? 1 : 0,
      oldpeak: this.formData.stDepression!,
      slope: this.mapSlope(this.formData.slope),
      ca: this.formData.majorVessels!,
      thal: this.mapThal(this.formData.thalassemia),
    };
  }

  mapSex(value: string): number {
    return value === 'male' ? 1 : 0;
  }

  mapChestPain(value: string): number {
    const mapping: Record<string, number> = {
      typical: 0,
      atypical: 1,
      'non-anginal': 2,
      asymptomatic: 3,
    };
    return mapping[value] ?? 0;
  }

  mapRestEcg(value: string): number {
    const mapping: Record<string, number> = {
      normal: 0,
      stt: 1,
      lvh: 2,
    };
    return mapping[value] ?? 0;
  }

  mapSlope(value: string): number {
    const mapping: Record<string, number> = {
      up: 0,
      flat: 1,
      down: 2,
    };
    return mapping[value] ?? 0;
  }

  mapThal(value: string): number {
    const mapping: Record<string, number> = {
      normal: 1,
      fixed: 2,
      reversible: 3,
    };
    return mapping[value] ?? 1;
  }

  // ==================== Navigation ====================

  navigateToECGAssessment(): void {
    console.log('Navigating to ECG Assessment...');
    this.router.navigate(['/ecg-assessment']);
  }

  // ==================== Utility Methods ====================

  resetForm(): void {
    if (
      confirm(
        'Are you sure you want to reset the form? All entered data will be lost.'
      )
    ) {
      this.formData = {
        age: null,
        sex: '',
        chestPainType: '',
        bloodPressure: null,
        cholesterol: null,
        fbs: null,
        restecg: '',
        maxHeartRate: null,
        exang: null,
        stDepression: null,
        slope: '',
        majorVessels: null,
        thalassemia: '',
      };

      this.predictionResult = undefined;
      this.showAllFeatures = false;
      this.currentStep = 1;
      this.updateProgress();
      this.scrollToTop();

      console.log('Form reset to initial state');
    }
  }

  getFormCompletionPercentage(): number {
    const totalFields = Object.keys(this.formData).length;
    let completedFields = 0;

    Object.keys(this.formData).forEach((key) => {
      const value = this.formData[key as keyof RiskAssessmentFormData];
      if (value !== null && value !== '') {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }
}