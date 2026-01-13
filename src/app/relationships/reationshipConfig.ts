type RelationshipConfig = {
  [dtoId: string]: string[];
};

export type dtoIdNameConfig = {
  name: string;
  id: string;
  icon: string;
  label: string;
};
const dtoIds: dtoIdNameConfig[] = [
  { name: 'User', id: 'DTO5520', icon: 'pi-users', label: 'Users' },
  { name: 'Role', id: 'DTO5522', icon: 'pi-key', label: 'Role' },
  { name: 'Employee', id: 'DTO5525', icon: 'pi-user-tie', label: 'Employee' },
  {
    name: 'Designation',
    id: 'DTO5526',
    icon: 'pi-briefcase',
    label: 'Designation',
  },
  {
    name: 'Department',
    id: 'DTO5527',
    icon: 'pi-briefcase',
    label: 'Department',
  },
  { name: 'Leave', id: 'DTO5528', icon: 'pi-umbrella', label: 'Leave' },
  {
    name: 'CoveringRequest',
    id: 'DTO5529',
    icon: 'pi-file-o',
    label: 'Covering Request',
  },
  {
    name: 'EvaluationForm',
    id: 'DTO5530',
    icon: 'pi-file-o',
    label: 'Evaluation Form',
  },
  {
    name: 'Attendance',
    id: 'DTO5531',
    icon: 'pi-clipboard-check',
    label: 'Attendance',
  },
  {
    name: 'IrregularAttendance',
    id: 'DTO5532',
    icon: 'pi-clock-o',
    label: 'Irregular Attendance',
  },
  { name: 'Holiday', id: 'DTO5533', icon: 'pi-grid', label: 'Holiday' },
  { name: 'Shift', id: 'DTO5534', icon: 'pi-clock', label: 'Shift' },
  { name: 'Payroll', id: 'DTO5535', icon: 'pi-credit-card', label: 'Payroll' },
  { name: 'PaySlip', id: 'DTO5536', icon: 'pi-notebook', label: 'Pay Slip' },
  { name: 'Report', id: 'DTO5537', icon: 'pi-file-o', label: 'Report' },
  {
    name: 'Notification',
    id: 'DTO5538',
    icon: 'pi-bell',
    label: 'Notification',
  },
  { name: 'Company', id: 'DTO5539', icon: 'pi-building', label: 'Company' },
  { name: 'Device', id: 'DTO5574', icon: 'pi-monitor.', label: 'Device' },
];

export const relationshipConfig: RelationshipConfig = {};

export const getDtoNameById = (id: string): string | undefined => {
  const dto = dtoIds.find((dto) => dto.id === id);
  return dto ? dto.name : undefined;
};

export const getDtoLabelAndIconById = (
  id: string,
): { label?: string; icon?: string } | undefined => {
  const dto = dtoIds.find((dto) => dto.id === id);
  return dto ? { label: dto.label, icon: dto.icon } : undefined;
};

export const getRelationshipListByDtoId = (
  dtoId: string,
): dtoIdNameConfig[] | undefined => {
  const relatedDtoIds = relationshipConfig[dtoId];

  if (relatedDtoIds === undefined) {
    return undefined;
  }
  const relatedDtoObjects = relatedDtoIds.map((id) => {
    const dto = dtoIds.find((dto) => dto.id === id);
    return dto
      ? dto
      : { name: id, id, icon: 'pi pi-question', label: 'Unknown' };
  });

  return relatedDtoObjects;
};
