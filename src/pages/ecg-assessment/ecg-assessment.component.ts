// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-ecg-assessment',
//   standalone: true,
//   imports: [],
//   templateUrl: './ecg-assessment.component.html',
//   styleUrl: './ecg-assessment.component.scss'
// })
// export class EcgAssessmentComponent {

// }

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Interface for analysis options
interface AnalysisOptions {
  autoDetectLeads: boolean;
  enhanceImage: boolean;
  generateDetailedReport: boolean;
}

// Interface for ECG analysis result
interface ECGAnalysisResult {
  success: boolean;
  analysisId?: string;
  findings?: string[];
  riskLevel?: string;
  confidence?: number;
  timestamp?: Date;
}

@Component({
  selector: 'app-ecg-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ecg-assessment.component.html',
  styleUrl: './ecg-assessment.component.scss',
})
export class EcgAssessmentComponent implements OnInit {
  // File upload references
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // File data
  uploadedFile: File | null = null;
  uploadedFileName: string = '';
  uploadedFileSize: string = '';
  uploadedFileType: string = '';
  imagePreviewUrl: string = '';

  // Drag and drop state
  isDragging: boolean = false;

  // Analysis state
  isAnalyzing: boolean = false;
  processingStatus: string = 'Uploading image...';
  processingProgress: number = 0;

  // Analysis options
  analysisOptions: AnalysisOptions = {
    autoDetectLeads: true,
    enhanceImage: true,
    generateDetailedReport: false,
  };

  // Accepted file types
  private readonly ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialization
    console.log('ECG Assessment Component initialized');
  }

  // ==================== File Upload Methods ====================

  /**
   * Trigger the hidden file input
   */
  triggerFileUpload(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file selection from input
   * @param event - File input change event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file);
    }
  }

  /**
   * Handle drag over event
   * @param event - Drag event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  /**
   * Handle drag leave event
   * @param event - Drag event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  /**
   * Handle file drop event
   * @param event - Drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  /**
   * Process and validate uploaded file
   * @param file - File to process
   */
  processFile(file: File): void {
    // Validate file type
    if (!this.ACCEPTED_TYPES.includes(file.type)) {
      this.showError(
        'Invalid file type. Please upload a PNG, JPG, or JPEG image.',
      );
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.showError(
        `File size exceeds 10MB limit. Your file is ${this.formatFileSize(file.size)}.`,
      );
      return;
    }

    // Store file information
    this.uploadedFile = file;
    this.uploadedFileName = file.name;
    this.uploadedFileSize = this.formatFileSize(file.size);
    this.uploadedFileType = this.getFileTypeLabel(file.type);

    // Generate image preview
    this.generateImagePreview(file);

    console.log('File uploaded successfully:', {
      name: this.uploadedFileName,
      size: this.uploadedFileSize,
      type: this.uploadedFileType,
    });
  }

  /**
   * Generate image preview URL
   * @param file - Image file
   */
  generateImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.imagePreviewUrl = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Remove uploaded file
   */
  removeFile(): void {
    this.uploadedFile = null;
    this.uploadedFileName = '';
    this.uploadedFileSize = '';
    this.uploadedFileType = '';
    this.imagePreviewUrl = '';

    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    console.log('File removed');
  }

  /**
   * Format file size to human readable format
   * @param bytes - File size in bytes
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file type label
   * @param mimeType - MIME type of file
   */
  getFileTypeLabel(mimeType: string): string {
    const typeMap: { [key: string]: string } = {
      'image/png': 'PNG Image',
      'image/jpeg': 'JPEG Image',
      'image/jpg': 'JPG Image',
    };
    return typeMap[mimeType] || 'Image';
  }

  // ==================== Analysis Methods ====================

  /**
   * Analyze the uploaded ECG image
   */
  analyzeECG(): void {
    if (!this.uploadedFile) {
      this.showError('Please upload an ECG image first.');
      return;
    }

    this.isAnalyzing = true;
    this.processingProgress = 0;

    // Simulate analysis process
    this.simulateAnalysis();
  }

  /**
   * Simulate ECG analysis with progress updates
   */
  simulateAnalysis(): void {
    const steps = [
      { status: 'Uploading image...', duration: 500, progress: 10 },
      { status: 'Preprocessing image...', duration: 800, progress: 25 },
      { status: 'Detecting ECG leads...', duration: 1000, progress: 40 },
      { status: 'Analyzing waveforms...', duration: 1200, progress: 60 },
      { status: 'Calculating measurements...', duration: 1000, progress: 75 },
      { status: 'Generating report...', duration: 800, progress: 90 },
      { status: 'Finalizing results...', duration: 500, progress: 100 },
    ];

    let currentStep = 0;

    const processStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        this.processingStatus = step.status;
        this.processingProgress = step.progress;

        setTimeout(() => {
          currentStep++;
          processStep();
        }, step.duration);
      } else {
        // Analysis complete
        this.completeAnalysis();
      }
    };

    processStep();
  }

  /**
   * Complete the analysis and handle results
   */
  completeAnalysis(): void {
    // Prepare submission data
    const submitData = this.prepareSubmissionData();

    // Call API to submit ECG analysis
    this.callECGAnalysisAPI(submitData);
  }

  /**
   * Prepare form data for submission
   */
  prepareSubmissionData(): FormData {
    const formData = new FormData();

    if (this.uploadedFile) {
      formData.append('ecgImage', this.uploadedFile);
    }

    // Append analysis options
    formData.append(
      'autoDetectLeads',
      String(this.analysisOptions.autoDetectLeads),
    );
    formData.append('enhanceImage', String(this.analysisOptions.enhanceImage));
    formData.append(
      'generateDetailedReport',
      String(this.analysisOptions.generateDetailedReport),
    );

    // Append metadata
    formData.append('fileName', this.uploadedFileName);
    formData.append('fileSize', String(this.uploadedFile?.size || 0));
    formData.append('timestamp', new Date().toISOString());

    return formData;
  }

  /**
   * Call API to submit ECG analysis
   * @param submitData - FormData to submit
   */
  callECGAnalysisAPI(submitData: FormData): void {
    // Example API call structure (uncomment when you have the API endpoint)

    /*
    // First, inject HttpClient in constructor:
    // constructor(private http: HttpClient, private router: Router) { }

    this.http.post<ECGAnalysisResult>('YOUR_API_ENDPOINT/analyze-ecg', submitData).subscribe({
      next: (response) => {
        console.log('ECG Analysis Response:', response);

        this.isAnalyzing = false;

        if (response.success) {
          // Navigate to results page
          this.router.navigate(['/ecg-results'], {
            queryParams: {
              analysisId: response.analysisId,
              riskLevel: response.riskLevel
            }
          });
        } else {
          this.showError('Analysis failed. Please try again.');
        }
      },
      error: (error) => {
        console.error('ECG Analysis Error:', error);
        this.isAnalyzing = false;

        if (error.status === 400) {
          this.showError('Invalid ECG image. Please upload a clear ECG scan.');
        } else if (error.status === 413) {
          this.showError('File too large. Please upload a smaller image.');
        } else if (error.status === 500) {
          this.showError('Server error. Please try again later.');
        } else {
          this.showError('Analysis failed. Please try again.');
        }
      }
    });
    */

    // For now, simulate success and navigate
    setTimeout(() => {
      this.isAnalyzing = false;

      alert(
        'ECG analysis completed successfully! You would now be redirected to the results page.',
      );

      // Mock navigation (uncomment when you have the router set up)
      // this.router.navigate(['/ecg-results'], {
      //   queryParams: { analysisId: 'mock-123' }
      // });
    }, 500);
  }

  // ==================== Navigation Methods ====================

  /**
   * Navigate back to clinical assessment
   */
  goBack(): void {
    // Navigate back to the clinical risk assessment page
    this.router.navigate(['/risk-assessment']);

    if (this.uploadedFile) {
      const confirmLeave = confirm(
        'Are you sure you want to go back? Your uploaded file will be lost.',
      );
      if (!confirmLeave) {
        return;
      }
    }

    // Navigate back (uncomment when you have the router set up)
    // this.router.navigate(['/risk-assessment']);

    // For now, just show message
    console.log('Navigating back to clinical assessment');
  }

  // ==================== Utility Methods ====================

  /**
   * Show error message
   * @param message - Error message to display
   */
  showError(message: string): void {
    alert(message);
    // You can replace this with a custom notification service
    // Example: this.toastr.error(message, 'Error');
  }

  /**
   * Show success message
   * @param message - Success message to display
   */
  showSuccess(message: string): void {
    alert(message);
    // You can replace this with a custom notification service
    // Example: this.toastr.success(message, 'Success');
  }

  /**
   * Reset component to initial state
   */
  resetComponent(): void {
    this.removeFile();
    this.isAnalyzing = false;
    this.processingProgress = 0;
    this.processingStatus = 'Uploading image...';
    this.analysisOptions = {
      autoDetectLeads: true,
      enhanceImage: true,
      generateDetailedReport: false,
    };
  }

  /**
   * Check if file is valid
   */
  isFileValid(): boolean {
    return this.uploadedFile !== null;
  }

  /**
   * Get analysis options summary
   */
  getAnalysisOptionsSummary(): string[] {
    const summary: string[] = [];

    if (this.analysisOptions.autoDetectLeads) {
      summary.push('Auto-detect ECG leads');
    }
    if (this.analysisOptions.enhanceImage) {
      summary.push('Enhance image quality');
    }
    if (this.analysisOptions.generateDetailedReport) {
      summary.push('Generate detailed report');
    }

    return summary;
  }

  /**
   * Export uploaded file information
   */
  exportFileInfo(): any {
    return {
      fileName: this.uploadedFileName,
      fileSize: this.uploadedFileSize,
      fileType: this.uploadedFileType,
      uploadTimestamp: new Date().toISOString(),
      analysisOptions: this.analysisOptions,
    };
  }
}
