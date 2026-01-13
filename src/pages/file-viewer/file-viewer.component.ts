import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

interface FileDocument {
  FileId: string;
  Url: string;
  fileName: string;
  FileType: string;
  CreatedAt: string;
  deleted: boolean;
}

@Component({
  selector: 'app-file-viewer',
  imports: [CommonModule, ButtonModule],
  templateUrl: './file-viewer.component.html',
  styleUrl: './file-viewer.component.scss'
})
export class FileViewerComponent {
  Files: FileDocument[] = [];
  selectedFile: FileDocument | null = null;
  selectedFileIndex: number = -1;
  
  private sanitizer = inject(DomSanitizer);
  private config = inject(DynamicDialogConfig);

  ngOnInit(): void {
    if (this.config.data != null) {
      console.log('Dialog data received:', this.config.data);
      
      // Handle both array of documents and single document
      if (Array.isArray(this.config.data)) {
        this.Files = this.config.data.filter((file: FileDocument) => !file.deleted);
      } else {
        // If it's a single document object, wrap it in an array
        this.Files = [this.config.data].filter((file: FileDocument) => !file.deleted);
      }
      
      console.log('Processed files:', this.Files);
      
      // Auto-select first file if available
      if (this.Files.length > 0) {
        this.selectFile(0);
      }
    }
  }

  selectFile(index: number): void {
    this.selectedFileIndex = index;
    this.selectedFile = this.Files[index];
  }

  isImage(url: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(url);
  }

  isPDF(url: string): boolean {
    return /\.pdf$/i.test(url);
  }

  getSafeUrl(fileUrl: string): SafeResourceUrl {
    const viewerUrl = 'https://docs.google.com/gview?url=' + encodeURIComponent(fileUrl) + '&embedded=true';
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
  }

  getFileIcon(url: string): string {
    if (this.isImage(url)) {
      return 'pi pi-image';
    } else if (this.isPDF(url)) {
      return 'pi pi-file-pdf';
    } else if (url.includes('.doc') || url.includes('.docx')) {
      return 'pi pi-file-word';
    } else if (url.includes('.xls') || url.includes('.xlsx')) {
      return 'pi pi-file-excel';
    } else {
      return 'pi pi-file';
    }
  }

  getDisplayName(fileName: string): string {
    // Convert camelCase or remove special characters for better display
    return fileName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  downloadFile(url: string, event: Event): void {
    event.stopPropagation();
    
    // Create a temporary anchor element for download
    const link = document.createElement('a');
    link.href = url;
    
    // Try to extract filename from URL or use a default name
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'download';
    link.download = filename;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openInNewTab(url: string): void {
    window.open(url, '_blank');
  }
}