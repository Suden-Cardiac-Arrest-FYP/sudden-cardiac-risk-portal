import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';
import { RoleConfigService } from '../../services/role-config.service';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private roleConfigService: RoleConfigService,
        private authService: AuthService
    ) {}
    canActivate(
        route: ActivatedRouteSnapshot,
    ): Promise<boolean> {
        return new Promise((resolve) => {
            this.authService.user$.subscribe((user) => {

                const userRole = user?.['user_metadata']?.['role'];

                this.roleConfigService.roleConfig$.subscribe((config) => {
                    if (!config || Object.keys(config).length === 0) {
                        return; 
                    }
                    
                    const dtoId = (route.data?.['requiredRoles'] as string) ?? '';
                    const requiredRoles = getRolesForService(dtoId, config);
                    const hasRequiredRole = requiredRoles.includes(userRole);
                    
                    if (hasRequiredRole) {
                        resolve(true);
                    } else {
                        this.router.navigate(['/notfound']);
                        resolve(false);
                    }
                });
            });
        });
    }
}


function getRolesForService(serviceId: string, config: any): string[] {
    const roles: string[] = [];
    for (const role in config) {
        if (config[role][serviceId] !== undefined) {
            roles.push(role);
        }
    }
    return roles;
}
