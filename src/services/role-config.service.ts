import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoleConfig } from '../app/access-control/roleConfig';

@Injectable({
  providedIn: 'root',
})
export class RoleConfigService {
  private http = inject(HttpClient);
  private roleConfigSubject = new BehaviorSubject<RoleConfig>({});
  roleConfig$ = this.roleConfigSubject.asObservable();

  setRoleConfig(config: RoleConfig) {
    this.roleConfigSubject.next(config);
  }

  getRoleConfig() {
    return this.roleConfigSubject.value;
  }
  SendFirstLoginEmail(req: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `https://manifest.cgaas.ai/CGaaS-Manifest/api/Send/first/login/email`,
      req,
    );
  }
}
