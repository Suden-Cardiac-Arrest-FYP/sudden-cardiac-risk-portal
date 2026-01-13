import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextarea } from 'primeng/inputtextarea';

import {
  IKPICategoryMarkHOD,
  IKPIDescriptionMarkHOD,
  IHODEmployeeDetails,
  IHODEvaluation,
  IHODKPICategory,
} from '../../../../dto/HOD.dto';
import { EvaluationTabService } from '../../../../services/EvaluationTab.service';

@Component({
  selector: 'app-hod-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
    Select,
    ToastModule,
    DatePipe,
  ],
  providers: [MessageService, EvaluationTabService],
  templateUrl: './hod-tab.component.html',
  styleUrl: './hod-tab.component.scss',
})
export class HODTabComponent implements OnInit, OnDestroy {
  ranges = [
    [
      ['A', '91 - 100', 'EXCELLENT'],
      ['D', '61 - 70', 'FAIR'],
    ],
    [
      ['B', '81 - 90', 'VERY GOOD'],
      ['E', '51 - 60', 'AVERAGE'],
    ],
    [
      ['C', '71 - 80', 'GOOD'],
      ['F', '< 50', 'POOR'],
    ],
  ];

  employeeDetails: IHODEmployeeDetails | null = null;
  kpiCategories: IHODKPICategory[] = [];
  selectedRanges: { [key: string]: string } = {};
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  currentYear: string = new Date().getFullYear().toString();
  evaluationFormId: string = '';
  employeeId: string = '';
  isReadMode: boolean = false;
  existingHODEvaluation: IHODEvaluation | null = null;

  rangeOptions = [
    { label: 'A (91-100) - EXCELLENT', value: 'A' },
    { label: 'B (81-90) - VERY GOOD', value: 'B' },
    { label: 'C (71-80) - GOOD', value: 'C' },
    { label: 'D (61-70) - FAIR', value: 'D' },
    { label: 'E (51-60) - AVERAGE', value: 'E' },
    { label: 'F (<50) - POOR', value: 'F' },
  ];

  yesNoOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  selectedIncrement: boolean | null = null;
  selectedPromotion: boolean | null = null;
  recommendation: string = '';

  private destroy$ = new Subject<void>();
  private evaluationTabService = inject(EvaluationTabService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.parent?.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.employeeId = params['employeeId'] || '';
        this.evaluationFormId = params['evaluationFormId'] || '';
        if (this.employeeId) {
          this.loadEmployeeJD(this.employeeId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployeeJD(employeeId: string): void {
    this.isLoading = true;
    const params = { employeeId: employeeId };

    this.evaluationTabService
      .findJdByEmployeeId(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.body) {
            this.employeeDetails = response.body as IHODEmployeeDetails;
            this.kpiCategories =
              (response.body as IHODEmployeeDetails).JobDescription
                ?.KPICategory || [];
            this.initializeSelectedRanges();

            setTimeout(() => {
              this.checkExistingHODEvaluation(employeeId);
            }, 100);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading JD:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load employee job description',
            life: 3000,
          });
          this.isLoading = false;
        },
      });
  }

  checkExistingHODEvaluation(employeeId: string): void {
    this.evaluationTabService
      .findHODEvaluationByEmployeeId(employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('HOD evaluation response:', response.body);
          if (
            response.body &&
            (response.body.HODEvaluationId || response.body.kpiDescriptions)
          ) {
            this.existingHODEvaluation = response.body;
            this.isReadMode = true;
            this.populateExistingData(response.body);
            this.messageService.add({
              severity: 'info',
              summary: 'Info',
              detail: 'Displaying existing HOD evaluation in read-only mode',
              life: 3000,
            });
          } else {
            this.isReadMode = false;
          }
        },
        error: (error) => {
          console.error('No existing HOD evaluation found:', error);
          this.isReadMode = false;
        },
      });
  }

  populateExistingData(hodEvaluation: IHODEvaluation): void {
    console.log('Populating existing HOD data:', hodEvaluation);

    // Populate KPI description marks
    if (
      hodEvaluation.kpiDescriptions &&
      hodEvaluation.kpiDescriptions.length > 0
    ) {
      hodEvaluation.kpiDescriptions.forEach((kpiDesc) => {
        if (kpiDesc.KPIDescriptionId && kpiDesc.KPIDescriptionMark) {
          this.selectedRanges[kpiDesc.KPIDescriptionId] =
            kpiDesc.KPIDescriptionMark;
          console.log(
            `Set range for ${kpiDesc.KPIDescriptionId}: ${kpiDesc.KPIDescriptionMark}`
          );
        }
      });
      console.log('Final selectedRanges:', this.selectedRanges);
    }

    // Populate recommendation fields
    this.selectedIncrement = hodEvaluation.IsIncrement ?? null;
    this.selectedPromotion = hodEvaluation.IsPromotion ?? null;
    this.recommendation = hodEvaluation.Recommendations || '';
  }

  initializeSelectedRanges(): void {
    this.selectedRanges = {};
    this.kpiCategories.forEach((category) => {
      category.KPIDescription?.forEach((description: any) => {
        if (description.KPIDescriptionId) {
          this.selectedRanges[description.KPIDescriptionId] = '';
        }
      });
    });
  }

  isFormValid(): boolean {
    if (this.isReadMode) return false;

    const allRangesSelected = Object.values(this.selectedRanges).every(
      (range) => range !== ''
    );
    const recommendationFieldsValid =
      this.selectedIncrement !== null &&
      this.selectedPromotion !== null &&
      this.recommendation.trim() !== '';

    return allRangesSelected && recommendationFieldsValid;
  }

  onSubmit(): void {
    if (this.isReadMode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Read Only Mode',
        detail: 'This evaluation is in read-only mode and cannot be modified',
        life: 3000,
      });
      return;
    }

    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please complete all required fields',
        life: 3000,
      });
      return;
    }

    this.isSubmitting = true;

    const kpiCategories: IKPICategoryMarkHOD[] = [];
    const kpiDescriptions: IKPIDescriptionMarkHOD[] = [];

    this.kpiCategories.forEach((category) => {
      if (category.KPICategoryId) {
        kpiCategories.push({
          KPICategoryId: category.KPICategoryId,
          KPICategoryMark: this.getCategoryAverageMark(category),
        });
      }

      category.KPIDescription?.forEach((description) => {
        if (
          description.KPIDescriptionId &&
          this.selectedRanges[description.KPIDescriptionId]
        ) {
          kpiDescriptions.push({
            KPIDescriptionId: description.KPIDescriptionId,
            KPIDescriptionMark:
              this.selectedRanges[description.KPIDescriptionId],
          });
        }
      });
    });

    const hodEvaluationData: IHODEvaluation = {
      EvaluationId: this.evaluationFormId,
      EmployeeId: this.employeeId,
      kpiCategories: kpiCategories,
      kpiDescriptions: kpiDescriptions,
      IsIncrement: this.selectedIncrement ?? false,
      IsPromotion: this.selectedPromotion ?? false,
      Recommendations: this.recommendation,
      EvaluationStatus: 'COMPLETED',
    };

    this.evaluationTabService
      .createHODEvaluation(hodEvaluationData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'HOD evaluation submitted successfully',
            life: 3000,
          });
          this.isSubmitting = false;
          this.router.navigate(['/evaluationform']);
        },
        error: (error) => {
          console.error('Error submitting HOD evaluation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit HOD evaluation',
            life: 3000,
          });
          this.isSubmitting = false;
        },
      });
  }

  getCategoryAverageMark(category: IHODKPICategory): string {
    if (!category.KPIDescription || category.KPIDescription.length === 0) {
      return 'A';
    }

    const marks = category.KPIDescription.map((desc) =>
      desc.KPIDescriptionId ? this.selectedRanges[desc.KPIDescriptionId] : ''
    ).filter((mark) => mark !== '');

    if (marks.length === 0) return 'A';

    const markValues: { [key: string]: number } = {
      A: 95,
      B: 85,
      C: 75,
      D: 65,
      E: 55,
      F: 45,
    };
    const average =
      marks.reduce((sum, mark) => sum + (markValues[mark] || 0), 0) /
      marks.length;

    if (average >= 90) return 'A';
    if (average >= 80) return 'B';
    if (average >= 70) return 'C';
    if (average >= 60) return 'D';
    if (average >= 50) return 'E';
    return 'F';
  }

  onCancel(): void {
    this.router.navigate(['/evaluationform']);
  }
}
