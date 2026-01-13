export interface INotification {
  NotificationId?: string;
  Title?: string;
  Message?: string;
  Status?: string;
  Recipient?: string;
  DateSent?: string;
}

export class NotificationDto implements INotification {
  constructor(
    public NotificationId?: string,
    public Title?: string,
    public Message?: string,
    public Status?: string,
    public Recipient?: string,
    public DateSent?: string,
  ) {}
}

export interface NotificationResponse {
  Count: number;
  Notification: INotification[];
}
