export interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon: string;
  choir_group_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  text: string;
  requiresAuth: boolean;
}