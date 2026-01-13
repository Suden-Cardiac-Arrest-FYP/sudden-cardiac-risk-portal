import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { RoleConfigService } from '../services/role-config.service';
import { RoleService } from '../services/Role.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IRole, RoleDto, RoleResponse } from '../dto/Role.dto';
import { PermissionCategories } from './access-control/roleConfig';
import { UserDto, UserResponse } from '../dto/User.dto';
import { UserService } from '../services/User.service';
import { AuthService, User } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  providers: [RoleConfigService, RoleService, UserService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  inputRoles: RoleDto[] | null = [];

  userRole: string | undefined = '';

  user: User | undefined = {};

  private destroy$ = new Subject<void>();
  private primeng = inject(PrimeNG);
  private roleService = inject(RoleService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.primeng.ripple.set(true);
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user !== null) {
        this.user = user;
        this.userRole = this.user?.['user_metadata']['role'];
        // if (
        //     this.user?.['user_metadata']['workspaceid'] !=
        //     environment.WORKSPACEID
        // ) {
        //     this.router.navigate(['/notfound']);
        // }
        localStorage.setItem('roleName', this.userRole || '');
        this.findAllRole({});
      } else {
        this.userRole = undefined;
      }
    });
    this.findAllRole({});
  }

  //--roles get--
  findAllRole(params: any) {
    const requestParams = {
      noPagination: 'true',
    };
    this.roleService
      .findAllRole(requestParams)
      .pipe(
        filter((res: HttpResponse<RoleResponse>) => res.ok),
        map((res: HttpResponse<RoleResponse>) => res.body),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (res: RoleResponse | null) => {
          if (res) {
            this.inputRoles = res?.Role;
            //--validate roles--
            this.handleRolesAuthentication();
          }
        },
        (res: HttpErrorResponse) => {
          console.log('error in extracting all Role', res);
        },
      );
  }

  //--handle authentication rules--
  handleRolesAuthentication() {
    //--check if available role is available--
    if (this.userRole) {
      if (this.userRole == 'Super-Admin') {
        //-check if super admin role available--
        const superAdminRole = this.inputRoles?.find((role) => {
          return role.Name === 'Super-Admin';
        });
        if (!superAdminRole?.RoleId) {
          //--create super admin role and user--
          this.createSuperAdminCredentials({
            Name: 'Super-Admin',
            //---!!!!!---this PermissionCategories must be hardcoded when generating app--
            PermissionCategories: PermissionCategories,
          });
        } else {
          //--super admin available--
          //--check super admin user available--
          this.validateSuperAdminRoleWithUser(superAdminRole);
        }
      } else {
        const userRoleStruct = this.inputRoles?.find((role) => {
          return role.Name === this.userRole;
        });
        if (userRoleStruct?.RoleId) {
          //--ok--
        } else {
          //--show error (no role available in that name)--
          console.error(
            'No role configuration available for user, please try again!',
          );
        }
      }
    } else {
      //--show error (no user role)--
      console.error(
        'Cannot get role configuration data from auth0, please try again!',
      );
    }
  }

  createSuperAdminCredentials(role: RoleDto) {
    this.roleService
      .createRole(role)
      .pipe(
        filter((res: HttpResponse<IRole>) => res.ok),
        map((res: HttpResponse<IRole>) => res.body),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (res: IRole | null) => {
          if (res) {
            const fullName = this.user?.name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            this.createSuperAdminUser({
              FirstName: firstName,
              LastName: lastName,
              RoleId: role.RoleId,
              RoleName: role.Name,
              Email: this.user?.email || '',
            });
          } else {
            // Show error (Failed to create role)
            console.error(
              'Failed to create super admin role, please try again!',
            );
          }
        },
        (error) => {
          // Show error (Failed to create role)
          console.error('Failed to create super admin role, please try again!');
        },
      );
  }

  createSuperAdminUser(user: UserDto) {
    this.userService
      .createUser(user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          //--all done and refresh--
        },
        (error) => {
          // Check if the error response indicates that the user already exists
          if (
            error.error?.operation === 'Failed' &&
            error.error?.error === 'user already exists'
          ) {
            // Handle the specific error case (user already exists)
          } else {
            // Show general error if the error does not match the specific case
            console.error(
              'Failed to create super admin user, please try again!',
            );
          }
        },
      );
  }

  validateSuperAdminRoleWithUser(role: RoleDto) {
    this.userService
      .findAllUser({})
      .pipe(
        filter((res: HttpResponse<UserResponse>) => res.ok),
        map((res: HttpResponse<UserResponse>) => res.body),
        takeUntil(this.destroy$),
      )
      .subscribe(
        (res: UserResponse | null) => {
          const superAdminUser = res?.User?.find((user) => {
            return user.RoleId === role.RoleId;
          });

          if (!superAdminUser?.UserId) {
            const fullName = this.user?.name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            //--no user for role--
            this.createSuperAdminUser({
              FirstName: firstName,
              LastName: lastName,
              RoleId: role.RoleId,
              RoleName: role.Name,
              Email: this.user?.email || '',
            });
          }
        },
        (res: HttpErrorResponse) => {
          console.error(
            'Cannot get role configuration data from user, please try again!',
          );
        },
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
