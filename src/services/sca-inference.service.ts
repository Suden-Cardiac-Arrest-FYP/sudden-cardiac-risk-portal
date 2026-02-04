import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

import {
  IClinicalInput,
  ClinicalPredictionDto
} from '../dto/Clinical-prediction.dto';

import {
  ECGPredictionDto
} from '../dto/Ecg-prediction.dto';

type ClinicalResponse = HttpResponse<ClinicalPredictionDto>;
type ECGResponse = HttpResponse<ECGPredictionDto>;

@Injectable({
  providedIn: 'root'
})
export class ScaInferenceService {

  resourceUrl = environment.ScaInferenceUrl;

  headers = {
    'Content-Type': 'application/json'
  };

  constructor(private http: HttpClient) {}

  /* ===========================
     Clinical (SVM) Prediction
  =========================== */

  predictClinical(
    payload: IClinicalInput
  ): Observable<ClinicalResponse> {
    return this.http.post<ClinicalPredictionDto>(
      `${this.resourceUrl}/clinical/predict`,
      payload,
      {
        observe: 'response',
        headers: this.headers
      }
    );
  }

  /* ===========================
     ECG (CNN) Prediction
  =========================== */

  predictECG(
    formData: FormData
  ): Observable<ECGResponse> {
    return this.http.post<ECGPredictionDto>(
      `${this.resourceUrl}/ecg/predict`,
      formData,
      {
        observe: 'response'
      }
    );
  }

  /* ===========================
     Service Health Check
  =========================== */

  healthCheck(): Observable<HttpResponse<any>> {
    return this.http.get(
      `${this.resourceUrl}`,
      { observe: 'response' }
    );
  }
}
