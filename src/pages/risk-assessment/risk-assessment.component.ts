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

interface RiskAssessmentFormData {
  age: number | null;
  sex: string;
  chestPainType: string;
  bloodPressure: number | null;
  cholesterol: number | null;
  fbs: boolean | null;
  restecg: string;
  maxHeartRate: number | null;
  exang: boolean | null;
  stDepression: number | null;
  slope: string;
  majorVessels: number | null;
  thalassemia: string;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface ChipOption {
  value: string;
  label: string;
}

interface DisplayFeature {
  key: string;
  value: number;
  impact: string;
  shap_value: number;
}

// Holds one error message per field (empty string = no error)
interface FormErrors {
  age: string;
  sex: string;
  chestPainType: string;
  bloodPressure: string;
  cholesterol: string;
  fbs: string;
  restecg: string;
  maxHeartRate: string;
  exang: string;
  stDepression: string;
  slope: string;
  majorVessels: string;
  thalassemia: string;
}

@Component({
  selector: 'app-risk-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-assessment.component.html',
  styleUrl: './risk-assessment.component.scss',
})
export class RiskAssessmentComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  progressPercentage = 0;

  loading = false;
  predictionResult?: ClinicalPredictionDto;
  showAllFeatures = false;

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

  // All field errors in one object – empty string means "no error"
  errors: FormErrors = {
    age: '',
    sex: '',
    chestPainType: '',
    bloodPressure: '',
    cholesterol: '',
    fbs: '',
    restecg: '',
    maxHeartRate: '',
    exang: '',
    stDepression: '',
    slope: '',
    majorVessels: '',
    thalassemia: '',
  };

  // ── Dropdown / chip options ─────────────────────────────────────────────
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
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.updateProgress();
    this.scrollToTop();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════

  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) return;
    if (step > this.currentStep && !this.validateCurrentStep()) return;
    this.currentStep = step;
    this.updateProgress();
    this.scrollToTop();
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) this.goToStep(this.currentStep + 1);
  }
  previousStep(): void {
    if (this.currentStep > 1) this.goToStep(this.currentStep - 1);
  }

  updateProgress(): void {
    this.progressPercentage =
      ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }
  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }
  isStepVisible(step: number): boolean {
    return this.currentStep === step;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CHIP SELECTION
  // ═══════════════════════════════════════════════════════════════════════

  selectChestPainType(value: string): void {
    this.formData.chestPainType = value;
    this.errors.chestPainType = ''; // clear error on selection
  }

  isChestPainTypeSelected(value: string): boolean {
    return this.formData.chestPainType === value;
  }

  selectRestecg(value: string): void {
    this.formData.restecg = value;
    this.errors.restecg = ''; // clear error on selection
  }

  isRestecgSelected(value: string): boolean {
    return this.formData.restecg === value;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VALIDATION  – returns true if step is valid, marks errors otherwise
  // ═══════════════════════════════════════════════════════════════════════

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
    let valid = true;

    // Age
    if (!this.formData.age) {
      this.errors.age = 'Age is required.';
      valid = false;
    } else if (this.formData.age < 18 || this.formData.age > 40) {
      this.errors.age = 'Age must be between 18 and 40.';
      valid = false;
    } else {
      this.errors.age = '';
    }

    // Sex
    if (!this.formData.sex) {
      this.errors.sex = 'Please select a sex.';
      valid = false;
    } else {
      this.errors.sex = '';
    }

    // Chest pain type
    if (!this.formData.chestPainType) {
      this.errors.chestPainType = 'Please select a chest pain type.';
      valid = false;
    } else {
      this.errors.chestPainType = '';
    }

    return valid;
  }

  validateStep2(): boolean {
    let valid = true;

    // Blood pressure
    if (!this.formData.bloodPressure) {
      this.errors.bloodPressure = 'Blood pressure is required.';
      valid = false;
    } else if (
      this.formData.bloodPressure < 50 ||
      this.formData.bloodPressure > 250
    ) {
      this.errors.bloodPressure =
        'Enter a valid value between 50 and 250 mm Hg.';
      valid = false;
    } else {
      this.errors.bloodPressure = '';
    }

    // Cholesterol
    if (!this.formData.cholesterol) {
      this.errors.cholesterol = 'Cholesterol is required.';
      valid = false;
    } else if (
      this.formData.cholesterol < 100 ||
      this.formData.cholesterol > 600
    ) {
      this.errors.cholesterol =
        'Enter a valid value between 100 and 600 mg/dl.';
      valid = false;
    } else {
      this.errors.cholesterol = '';
    }

    // Fasting blood sugar
    if (this.formData.fbs === null) {
      this.errors.fbs = 'Please select fasting blood sugar status.';
      valid = false;
    } else {
      this.errors.fbs = '';
    }

    // Resting ECG
    if (!this.formData.restecg) {
      this.errors.restecg = 'Please select a resting ECG result.';
      valid = false;
    } else {
      this.errors.restecg = '';
    }

    return valid;
  }

  validateStep3(): boolean {
    let valid = true;

    // Max heart rate
    if (!this.formData.maxHeartRate) {
      this.errors.maxHeartRate = 'Max heart rate is required.';
      valid = false;
    } else if (
      this.formData.maxHeartRate < 60 ||
      this.formData.maxHeartRate > 220
    ) {
      this.errors.maxHeartRate = 'Enter a valid value between 60 and 220 bpm.';
      valid = false;
    } else {
      this.errors.maxHeartRate = '';
    }

    // Exercise induced angina
    if (this.formData.exang === null) {
      this.errors.exang = 'Please select exercise induced angina status.';
      valid = false;
    } else {
      this.errors.exang = '';
    }

    // ST depression
    if (this.formData.stDepression === null) {
      this.errors.stDepression = 'ST depression is required.';
      valid = false;
    } else if (
      this.formData.stDepression < 0 ||
      this.formData.stDepression > 10
    ) {
      this.errors.stDepression = 'Enter a valid value between 0 and 10.';
      valid = false;
    } else {
      this.errors.stDepression = '';
    }

    // Slope
    if (!this.formData.slope) {
      this.errors.slope = 'Please select ST slope.';
      valid = false;
    } else {
      this.errors.slope = '';
    }

    // Major vessels
    if (this.formData.majorVessels === null) {
      this.errors.majorVessels = 'Please select number of major vessels.';
      valid = false;
    } else {
      this.errors.majorVessels = '';
    }

    // Thalassemia
    if (!this.formData.thalassemia) {
      this.errors.thalassemia = 'Please select thalassemia type.';
      valid = false;
    } else {
      this.errors.thalassemia = '';
    }

    return valid;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════

  submitAssessment(): void {
    const step1Valid = this.validateStep1();
    const step2Valid = this.validateStep2();
    const step3Valid = this.validateStep3();

    if (!step1Valid || !step2Valid || !step3Valid) return;

    const payload: IClinicalInput = this.mapToClinicalDto();
    this.loading = true;
    this.predictionResult = undefined;

    this.scaService.predictClinical(payload).subscribe({
      next: (response) => {
        this.loading = false;
        const apiResponse = response.body as any;

        if (apiResponse?.record) {
          const record = apiResponse.record;
          this.predictionResult = new ClinicalPredictionDto(
            record.ClinicalPrediction.Prediction,
            record.ClinicalPrediction.PredictionText,
            {
              disease: record.ClinicalPrediction.DiseaseProb,
              no_disease: 1 - record.ClinicalPrediction.DiseaseProb,
            },
            this.transformFeatures(record.XAI.FeatureImportance),
            this.transformFeatures(record.XAI.AllFeatures),
          );

          setTimeout(() => {
            document
              .querySelector('.result-container')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Clinical prediction error:', error);
      },
    });
  }

  private transformFeatures(
    features: Record<string, any>,
  ): Record<string, IFeatureImpact> {
    const out: Record<string, IFeatureImpact> = {};
    if (features) {
      Object.keys(features).forEach((k) => {
        out[k] = {
          value: features[k].value,
          shap_value: features[k].shap_value,
          impact: features[k].impact,
        };
      });
    }
    return out;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // XAI DISPLAY
  // ═══════════════════════════════════════════════════════════════════════

  getTopFeatures(): DisplayFeature[] {
    if (!this.predictionResult?.feature_importance) return [];
    return Object.entries(this.predictionResult.feature_importance)
      .map(([key, f]) => ({
        key,
        value: f.value ?? 0,
        impact: f.impact ?? '',
        shap_value: f.shap_value ?? 0,
      }))
      .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
      .slice(0, 5);
  }

  getAllFeaturesSorted(): DisplayFeature[] {
    if (!this.predictionResult?.all_features) return [];
    return Object.entries(this.predictionResult.all_features)
      .map(([key, f]) => ({
        key,
        value: f.value ?? 0,
        impact: f.impact ?? '',
        shap_value: f.shap_value ?? 0,
      }))
      .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  }

  getAllFeaturesCount(): number {
    return this.predictionResult?.all_features
      ? Object.keys(this.predictionResult.all_features).length
      : 0;
  }
  toggleAllFeatures(): void {
    this.showAllFeatures = !this.showAllFeatures;
  }

  getFeatureBarWidth(v: number): number {
    if (!this.predictionResult?.feature_importance) return 0;
    const max = Math.max(
      ...Object.values(this.predictionResult.feature_importance).map((f) =>
        Math.abs(f.shap_value ?? 0),
      ),
    );
    return max > 0 ? (Math.abs(v) / max) * 100 : 0;
  }

  getShapBarWidth(v: number): number {
    if (!this.predictionResult?.all_features) return 0;
    const max = Math.max(
      ...Object.values(this.predictionResult.all_features).map((f) =>
        Math.abs(f.shap_value ?? 0),
      ),
    );
    return max > 0 ? (Math.abs(v) / max) * 100 : 0;
  }

  getFeatureDisplayName(key: string): string {
    const m: Record<string, string> = {
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
    return m[key] || key;
  }

  getFeatureIcon(key: string): string {
    const m: Record<string, string> = {
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
    return m[key] || '📋';
  }

  formatFeatureValue(key: string, value: number): string {
    if (key === 'sex') return value === 1 ? 'Male' : 'Female';
    if (key === 'fbs' || key === 'exang') return value === 1 ? 'Yes' : 'No';
    if (key === 'cp')
      return (
        (
          {
            0: 'Typical Angina',
            1: 'Atypical Angina',
            2: 'Non-anginal',
            3: 'Asymptomatic',
          } as Record<number, string>
        )[value] ?? String(value)
      );
    if (key === 'restecg')
      return (
        (
          { 0: 'Normal', 1: 'ST-T Abnormality', 2: 'LV Hypertrophy' } as Record<
            number,
            string
          >
        )[value] ?? String(value)
      );
    if (key === 'slope')
      return (
        (
          { 0: 'Upsloping', 1: 'Flat', 2: 'Downsloping' } as Record<
            number,
            string
          >
        )[value] ?? String(value)
      );
    if (key === 'thal')
      return (
        (
          { 1: 'Normal', 2: 'Fixed Defect', 3: 'Reversible Defect' } as Record<
            number,
            string
          >
        )[value] ?? String(value)
      );
    if (key === 'oldpeak') return value.toFixed(1);
    return Math.round(value).toString();
  }

  getFactorCardClass(f: DisplayFeature): string {
    return f.impact === 'Increases' ? 'factor-increases' : 'factor-decreases';
  }
  getImpactClass(impact: string): string {
    return impact === 'Increases' ? 'impact-negative' : 'impact-positive';
  }

  getClinicalInterpretation(): string {
    if (!this.predictionResult) return '';
    const p = this.predictionResult.prediction ?? 0;
    const prob = (
      (this.predictionResult.probability?.disease ?? 0) * 100
    ).toFixed(2);
    return p === 0
      ? `Based on the clinical data provided, the AI model predicts a low risk of Sudden Cardiac Arrest (SCA) with a disease probability of ${prob}%. Continuous monitoring and regular follow-ups are recommended.`
      : `Based on the clinical data provided, the AI model predicts an elevated risk of Sudden Cardiac Arrest (SCA) with a disease probability of ${prob}%. Immediate consultation with a cardiologist is strongly recommended.`;
  }

  getRiskLevelClass(): string {
    return this.predictionResult
      ? this.predictionResult.prediction === 1
        ? 'high-risk'
        : 'low-risk'
      : '';
  }
  getRiskIcon(): string {
    return this.predictionResult
      ? this.predictionResult.prediction === 1
        ? '⚠️'
        : '✅'
      : '🏥';
  }
  getFinalDecisionText(): string {
    return this.predictionResult
      ? this.predictionResult.prediction === 1
        ? 'HIGH RISK'
        : 'LOW RISK'
      : '';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DOWNLOAD REPORT
  // ═══════════════════════════════════════════════════════════════════════

  downloadReport(): void {
    if (!this.predictionResult) return;
    const report = {
      assessmentDate: new Date().toISOString(),
      patientData: { ...this.formData },
      prediction: {
        result: this.predictionResult.prediction_text,
        diseaseProb: this.predictionResult.probability?.disease,
        noDiseaseProb: this.predictionResult.probability?.no_disease,
        interpretation: this.getClinicalInterpretation(),
      },
      topFeatures: this.getTopFeatures(),
      allFeatures: this.predictionResult.all_features,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sca-risk-assessment-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAPPING
  // ═══════════════════════════════════════════════════════════════════════

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

  mapSex(v: string) {
    return v === 'male' ? 1 : 0;
  }
  mapChestPain(v: string) {
    return (
      (
        {
          typical: 0,
          atypical: 1,
          'non-anginal': 2,
          asymptomatic: 3,
        } as Record<string, number>
      )[v] ?? 0
    );
  }
  mapRestEcg(v: string) {
    return ({ normal: 0, stt: 1, lvh: 2 } as Record<string, number>)[v] ?? 0;
  }
  mapSlope(v: string) {
    return ({ up: 0, flat: 1, down: 2 } as Record<string, number>)[v] ?? 0;
  }
  mapThal(v: string) {
    return (
      ({ normal: 1, fixed: 2, reversible: 3 } as Record<string, number>)[v] ?? 1
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════════════

  navigateToECGAssessment(): void {
    this.router.navigate(['/ecg-assessment']);
  }

  resetForm(): void {
    if (
      !confirm(
        'Are you sure you want to reset the form? All entered data will be lost.',
      )
    )
      return;
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
    this.errors = {
      age: '',
      sex: '',
      chestPainType: '',
      bloodPressure: '',
      cholesterol: '',
      fbs: '',
      restecg: '',
      maxHeartRate: '',
      exang: '',
      stDepression: '',
      slope: '',
      majorVessels: '',
      thalassemia: '',
    };
    this.predictionResult = undefined;
    this.showAllFeatures = false;
    this.currentStep = 1;
    this.updateProgress();
    this.scrollToTop();
  }

  getFormCompletionPercentage(): number {
    const total = Object.keys(this.formData).length;
    const completed = Object.values(this.formData).filter(
      (v) => v !== null && v !== '',
    ).length;
    return Math.round((completed / total) * 100);
  }
}
