export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
};

export type UnreadCountResponse = {
  count: number;
};

export type MarkAllReadResponse = {
  message: string;
  count: number;
};
