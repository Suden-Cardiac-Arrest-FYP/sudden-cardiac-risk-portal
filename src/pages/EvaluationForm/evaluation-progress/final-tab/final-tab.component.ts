import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { EvaluationTabService } from '../../../../services/EvaluationTab.service';
import { AuthService } from '@auth0/auth0-angular';
import { 
  IFinalEvaluationResponse, 
  IKPICategoryFinal, 
  IKPIDescriptionFinal 
} from '../../../../dto/Final.dto';

@Component({
  selector: 'app-final-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService, EvaluationTabService],
  templateUrl: './final-tab.component.html',
  styleUrl: './final-tab.component.scss'
})
export class FinalTabComponent implements OnInit, OnDestroy {
  finalEvaluationData: IFinalEvaluationResponse | null = null;
  kpiCategoriesData: IKPICategoryFinal[] = [];
  kpiDescriptionsData: IKPIDescriptionFinal[] = [];
  isLoading: boolean = false;
  employeeId: string = '';
  evaluationFormId: string = '';
  user: any = null;
  userRole: string = '';
  isEmployee: boolean = false;

  private destroy$ = new Subject<void>();
  private evaluationTabService = inject(EvaluationTabService);
  private authService = inject(AuthService); 
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'] || '';
        this.isEmployee = this.userRole.toLowerCase() === 'employee';
        
        console.log('User role:', this.userRole);
        console.log('Is employee:', this.isEmployee);
      }
    });
    this.route.parent?.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.employeeId = params['employeeId'] || '';
        this.evaluationFormId = params['evaluationFormId'] || '';
        if (this.employeeId) {
          this.loadFinalEvaluation();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFinalEvaluation(): void {
    this.isLoading = true;
    
    this.evaluationTabService
      .findFinalEvaluationByEmployeeId(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Final evaluation response:', response.body);
          if (response.body) {
            this.finalEvaluationData = response.body;
            this.kpiCategoriesData = response.body.kpiCategories || [];
            this.kpiDescriptionsData = response.body.kpiDescriptions || [];
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Final evaluation summary loaded successfully',
              life: 3000,
            });
          } else {
            this.messageService.add({
              severity: 'info',
              summary: 'No Data',
              detail: 'No final evaluation data found for this employee',
              life: 3000,
            });
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading final evaluation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load final evaluation summary',
            life: 3000,
          });
          this.isLoading = false;
        },
      });
  }

  getGradeClass(grade: string | undefined): string {
    if (!grade) return 'bg-gray-100 text-gray-800';
    
    switch (grade.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'B':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'E':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'F':
        return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  }

  getNumericValue(grade: string | undefined): number {
    if (!grade) return 0;
    
    const gradeValues: { [key: string]: number } = {
      A: 95,
      B: 85,
      C: 75,
      D: 65,
      E: 55,
      F: 45,
    };
    
    return gradeValues[grade.toUpperCase()] || 0;
  }

  getAverageCategoryScore(): string {
    if (this.kpiCategoriesData.length === 0) return '0.0';
    
    const grades = [
      ...this.kpiCategoriesData.map(cat => cat.kpiCategoryMarkSelf),
      ...this.kpiCategoriesData.map(cat => cat.kpiCategoryMarkHOD),
      ...this.kpiCategoriesData.map(cat => cat.kpiCategoryMarkGM),
      ...this.kpiCategoriesData.map(cat => cat.kpiCategoryMarkCEO),
    ].filter(grade => grade);
    
    if (grades.length === 0) return '0.0';
    
    const totalScore = grades.reduce((sum, grade) => sum + this.getNumericValue(grade), 0);
    const average = totalScore / grades.length;
    
    return average.toFixed(1);
  }

  getAverageKPIScore(): string {
    if (this.kpiDescriptionsData.length === 0) return '0.0';
    
    const grades = [
      ...this.kpiDescriptionsData.map(desc => desc.kpiDescriptionMarkSelf),
      ...this.kpiDescriptionsData.map(desc => desc.kpiDescriptionMarkHOD),
      ...this.kpiDescriptionsData.map(desc => desc.kpiDescriptionMarkGM),
      ...this.kpiDescriptionsData.map(desc => desc.kpiDescriptionMarkCEO),
    ].filter(grade => grade);
    
    if (grades.length === 0) return '0.0';
    
    const totalScore = grades.reduce((sum, grade) => sum + this.getNumericValue(grade), 0);
    const average = totalScore / grades.length;
    
    return average.toFixed(1);
  }

  onCancel(): void {
    this.router.navigate(['/evaluationform']);
  }
}