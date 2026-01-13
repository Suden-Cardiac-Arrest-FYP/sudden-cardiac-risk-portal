import { AppConfigService } from '../../../services/appconfigservice';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuItem, SelectItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { KnobModule } from 'primeng/knob';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { filter } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { RippleModule } from 'primeng/ripple';
import { roleConfig } from '../../access-control/roleConfig';
import { Popover, PopoverModule } from 'primeng/popover';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationEvent,
} from '@angular/animations';

interface NavItem {
  icon: string;
  title: string;
  routerLink: string;
  id: string;
}

interface CategoryGroup {
  name: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DropdownModule,
    CalendarModule,
    ChartModule,
    InputSwitchModule,
    ToggleSwitchModule,
    BadgeModule,
    TabMenuModule,
    FormsModule,
    DividerModule,
    AvatarModule,
    TooltipModule,
    DrawerModule,
    OverlayBadgeModule,
    KnobModule,
    ButtonModule,
    RippleModule,
    PopoverModule,
  ],
  templateUrl: './sidebar.component.html',
  animations: [
    trigger('submenuAnimation', [
      state(
        'collapsed',
        style({
          height: '0',
          opacity: 0,
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
  styles: [
    `
      .scrollbar-hide {
        overflow: auto;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class MainsectionComponent implements OnInit {
  @ViewChild('op') op!: Popover;
  selectedSampleOption: any;

  sampleOptions: any;

  sampleAppsSidebarNavs: any[] = [];
  categorizedNavItems: CategoryGroup[] = [];
  filteredMainItems: any[] = [];
  filteredOtherItems: any[] = [];

  sampleAppsSidebarNavsMore: any;

  selectedSampleAppsSidebarNav: any;
  selectedProductSubItem: string = '';

  isSlimMenu: boolean = false;

  visibleRight: boolean = false;

  selectButtonValue: SelectItem | undefined;

  selectButtonOptions: SelectItem[] | undefined;

  items: MenuItem[] | undefined;

  appConfigService = inject(AppConfigService);

  ProfileData: any;

  roleConfig = roleConfig;

  userRole: any;

  private categoryMappings = {
    Dashboard: ['Dashboard', 'My Profile'],
    'Employee Management': [
      'Employee',
      'Designation',
      'Department',
      'Evaluation Form',
    ],
    'Leave & Attendance': [
      'Attendance',
      'Holiday',
      'Shift',
      'Leave',
      'Covering Request',
    ],

    'Report & Payslip': ['Paysheet', 'Report', 'Payslips'],
    'User & Access': ['Role', 'Users'],
    'System Settings': ['Settings'],
  };

  get isDarkMode(): boolean {
    return this.appConfigService.appState().darkTheme;
  }

  toggle(event: any) {
    this.op.toggle(event);
  }

  private auth = inject(AuthService);
  private router = inject(Router);
  private doc = inject(DOCUMENT);

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateSlimMenu(window.innerWidth);
  }

  getLogoSrc(): string {
    return this.isDarkMode
      ? 'https://sca-mihishi-s3-bucket.s3.eu-west-2.amazonaws.com/sca-logo.jpg'
      : 'https://sca-mihishi-s3-bucket.s3.eu-west-2.amazonaws.com/sca-logo.jpg';
  }

  logout() {
    this.op.hide();
    sessionStorage.removeItem('BranchId');
    this.auth.logout({ logoutParams: { returnTo: this.doc.location.origin } });
  }

  ngOnInit() {
    this.auth.user$.subscribe((user: any) => {
      if (user) {
        this.ProfileData = user;
        this.userRole = localStorage.getItem('roleName');
        this.filterSidebarNavs();
      }
    });

    this.updateSlimMenu(window.innerWidth);

    this.sampleAppsSidebarNavsMore = [];

    this.updateSelectedNav(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateSelectedNav(event.urlAfterRedirects || event.url);
      });
    this.selectButtonValue = { label: 'Styled', value: 1 };

    this.selectButtonOptions = [
      { label: 'Styled', value: 1 },
      { label: 'Unstyled', value: 2 },
    ];
  }

  LayoutClick(event: Event) {
    if (this.isSlimMenu) {
      event.stopPropagation();
      this.appConfigService.toggleSidebar();
    }
  }

  toggleDarkMode() {
    this.appConfigService.appState.update((state: { darkTheme: any }) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }

  private updateSlimMenu(width: number): void {
    this.isSlimMenu = width < 768;
  }

  private async updateSelectedNav(url: string): Promise<void> {
    await this.waitForRoleConfig();

    const slashIndex = this.nthIndex(url, '/', 2);
    const baseUrl = (slashIndex >= 0 ? url.slice(0, slashIndex) : url).split(
      '?'
    )[0];
    if (baseUrl.includes('/evaluationprogress')) {
      this.selectedSampleAppsSidebarNav = 'Evaluation Form';
      this.selectedProductSubItem = '';
      return;
    }
    const matchingNav = this.sampleAppsSidebarNavs.find(
      (nav: any) => baseUrl === nav.routerLink && !nav.group
    );

    this.selectedProductSubItem = '';
    this.selectedSampleAppsSidebarNav = matchingNav
      ? matchingNav.title
      : 'Dashboard';
  }

  nthIndex(str: string, pat: string, n: number): number {
    let i = -1;
    while (n-- > 0 && i < str.length) {
      i = str.indexOf(pat, i + 1);
      if (i < 0) return -1;
    }
    return i;
  }

  private waitForRoleConfig(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (roleConfig && Object.keys(roleConfig).length > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  getRolesForService(serviceId: string): string[] {
    const roles: string[] = [];
    for (const role in this.roleConfig) {
      if (this.roleConfig[role]?.[serviceId] !== undefined) {
        roles.push(role);
      }
    }
    return roles;
  }

  private categorizeNavItems(navItems: NavItem[]): CategoryGroup[] {
    const categories: CategoryGroup[] = [];
    const usedItems = new Set<string>();

    // Create categories in the specified order
    Object.entries(this.categoryMappings).forEach(
      ([categoryName, itemTitles]) => {
        const categoryItems: NavItem[] = [];
        itemTitles.forEach((title) => {
          const matchingItem = navItems.find((item) => item.title === title);
          if (matchingItem && !usedItems.has(matchingItem.title)) {
            categoryItems.push(matchingItem);
            usedItems.add(matchingItem.title);
          }
        });

        if (categoryItems.length > 0) {
          categories.push({
            name: categoryName,
            items: categoryItems,
          });
        }
      }
    );

    // Add remaining items to "Unknown" category
    const unknownItems = navItems.filter((item) => !usedItems.has(item.title));
    if (unknownItems.length > 0) {
      categories.push({
        name: 'Unknown',
        items: unknownItems,
      });
    }

    return categories;
  }

  filterSidebarNavs() {
    if (this.userRole) {
      const allNavItems = [
        { icon: 'pi pi-th-large', title: 'Dashboard', routerLink: '', id: '' },
        {
          icon: 'pi pi-user',
          title: 'My Profile',
          routerLink: '/my-profile',
          id: 'DTO6000',
        },
        {
          icon: 'pi pi-credit-card',
          title: 'Paysheet',
          routerLink: '/paysheet',
          id: 'DTO5535',
        },
        {
          icon: 'pi pi-check-square',
          title: 'Attendance',
          routerLink: '/attendance',
          id: 'DTO5531',
        },
        // {
        //   icon: 'pi pi-bell',
        //   title: 'Notification',
        //   routerLink: '/notification',
        //   id: 'DTO5538',
        // },
        {
          icon: 'pi pi-file-o',
          title: 'Report',
          routerLink: '/report',
          id: 'DTO5537',
        },
        {
          icon: 'pi pi-users',
          title: 'Employee',
          routerLink: '/employee',
          id: 'DTO5525',
        },
        // {
        //   icon: 'pi pi-receipt',
        //   title: 'Pay Slip',
        //   routerLink: '/payslip',
        //   id: 'DTO5536',
        // },
        {
          icon: 'pi pi-briefcase',
          title: 'Designation',
          routerLink: '/designation',
          id: 'DTO5526',
        },
        // REMOVE OR COMMENT OUT these standalone items since they're now tabs:
        // {
        //   icon: 'pi pi-list-check',
        //   title: 'Irregular Attendance',
        //   routerLink: '/irregularattendance',
        //   id: 'DTO5532',
        // },
        // {
        //   icon: 'pi pi-tablet',
        //   title: 'Device',
        //   routerLink: '/device',
        //   id: 'DTO5574',
        // },
        {
          icon: 'pi pi-briefcase',
          title: 'Department',
          routerLink: '/department',
          id: 'DTO5527',
        },
        {
          icon: 'pi pi-sparkles',
          title: 'Holiday',
          routerLink: '/holiday',
          id: 'DTO5533',
        },
        {
          icon: 'pi pi-clock',
          title: 'Shift',
          routerLink: '/shift',
          id: 'DTO5534',
        },
        {
          icon: 'pi pi-thumbtack',
          title: 'Leave',
          routerLink: '/leave',
          id: 'DTO5528',
        },
        {
          icon: 'pi pi-file-o',
          title: 'Covering Request',
          routerLink: '/coveringrequest',
          id: 'DTO5529',
        },
        {
          icon: 'pi pi-address-book',
          title: 'Evaluation Form',
          routerLink: '/evaluationform',
          id: 'DTO5530',
        },
        {
          icon: 'pi pi-address-book',
          title: 'Evaluation Progress',
          routerLink: '/evaluationprogress',
          id: 'DTO5541',
        },
        {
          icon: 'pi pi-cog',
          title: 'Settings',
          routerLink: '/company',
          id: 'DTO5539',
        },
        {
          icon: 'pi pi-key',
          title: 'Role',
          routerLink: '/role',
          id: 'DTO5522',
        },
        {
          icon: 'pi pi-users',
          title: 'Users',
          routerLink: '/user',
          id: 'DTO5520',
        },
        {
          icon: 'pi pi-wallet',
          title: 'Payslips',
          routerLink: '/payslips',
          id: 'DTO6003',
        },
      ];

      const filteredItems = allNavItems.filter((item) => {
        if (!item.id) {
          return true;
        }
        const allowedRoles = this.getRolesForService(item.id);
        return allowedRoles.includes(this.userRole as string);
      });

      this.sampleAppsSidebarNavs = filteredItems;

      this.categorizedNavItems = this.categorizeNavItems(filteredItems);

      this.filteredMainItems = filteredItems.filter(
        (item) => item.title === 'Dashboard'
      );

      this.filteredOtherItems = filteredItems.filter(
        (item) => item.title !== 'Dashboard'
      );
    }
  }
}
