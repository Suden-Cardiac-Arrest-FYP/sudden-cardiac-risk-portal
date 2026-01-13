import { PermissionCategoryDto } from '../../dto/Role.dto';
export type RolePermissions = {
  [dtoId: string]: string[] | undefined;
};

export type RoleConfig = {
  [roleName: string]: RolePermissions;
};

export const roleConfig: RoleConfig = {};
export const PermissionCategories: PermissionCategoryDto[] = [
  {
    ServiceName: 'User',
    ServiceId: 'DTO5520',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Role',
    ServiceId: 'DTO5522',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Employee',
    ServiceId: 'DTO5525',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Designation',
    ServiceId: 'DTO5526',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Department',
    ServiceId: 'DTO5527',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Leave',
    ServiceId: 'DTO5528',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
      { Name: 'Approved', Key: 'AP' },
    ],
  },

  {
    ServiceName: 'CoveringRequest',
    ServiceId: 'DTO5529',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
      { Name: 'HOD', Key: 'H' },
      { Name: 'Employee', Key: 'E' },
    ],
  },

  {
    ServiceName: 'EvaluationForm',
    ServiceId: 'DTO5530',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
       { Name: 'Employee', Key: 'E' },
    ],
  },

  {
    ServiceName: 'Attendance',
    ServiceId: 'DTO5531',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
      { Name: 'ReadAll', Key: 'RA' },
    ],
  },

  {
    ServiceName: 'IrregularAttendance',
    ServiceId: 'DTO5532',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Holiday',
    ServiceId: 'DTO5533',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Shift',
    ServiceId: 'DTO5534',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Payroll',
    ServiceId: 'DTO5535',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'PaySlip',
    ServiceId: 'DTO5536',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Report',
    ServiceId: 'DTO5537',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Notification',
    ServiceId: 'DTO5538',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Company',
    ServiceId: 'DTO5539',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },
  {
    ServiceName: 'Device',
    ServiceId: 'DTO5574',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },
  {
    ServiceName: 'My-Profile',
    ServiceId: 'DTO6000',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },
  {
    ServiceName: 'Evaluation-Progress',
    ServiceId: 'DTO6001',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'PaySheet',
    ServiceId: 'DTO6002',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Employee-PaySlips',
    ServiceId: 'DTO6003',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Self-Evaluation',
    ServiceId: 'DTO6004',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Hod-Evaluation',
    ServiceId: 'DTO6005',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Gm-Evaluation',
    ServiceId: 'DTO6006',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Ceo-Evaluation',
    ServiceId: 'DTO6007',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },

  {
    ServiceName: 'Final-Evaluation',
    ServiceId: 'DTO6008',
    Permissions: [
      { Name: 'Add', Key: 'A' },
      { Name: 'Update', Key: 'U' },
      { Name: 'Read', Key: 'R' },
      { Name: 'Delete', Key: 'D' },
    ],
  },
];
