export interface IAppNotification {
  NotificationId?: string;
  Title?: string;
  Content?: string;
  EmployeeId?: string;
  Url?: string;
  SentAt?: string;
  MarkAsRead?: boolean;
  deleted?: boolean;
}

export class AppNotificationDto implements IAppNotification {
  constructor(
    public NotificationId?: string,
    public Title?: string,
    public Content?: string,
    public EmployeeId?: string,
    public Url?: string,
    public SentAt?: string,
    public MarkAsRead?: boolean,
    public deleted?: boolean,
  ) {}
}

export interface AppNotificationResponse {
  Count: number;
  Notification: IAppNotification[];
}
