export type PersonalInfo = {
  section?: string;
  roll_no?: string;
  branch?: string;
  blood_group?: string;
  hostel_block?: string;
  room_no?: string;
  date_of_birth?: string;
  has_muj_alumni?: boolean;
  alumni_details?: string;
  father_name?: string;
  father_mobile?: string;
  father_email?: string;
  father_occupation?: string;
  father_organization?: string;
  father_designation?: string;
  mother_name?: string;
  mother_mobile?: string;
  mother_email?: string;
  mother_occupation?: string;
  mother_organization?: string;
  mother_designation?: string;
  communication_address?: string;
  communication_pincode?: string;
  permanent_address?: string;
  permanent_pincode?: string;
  business_card_url?: string;
  phone?: string;
  email?: string;
};

export type SavePersonalInfoInput = PersonalInfo;

export type PersonalInfoResponse =
  | PersonalInfo
  | { data?: PersonalInfo }
  | { message: string };

export type MenteeProfile = {
  id: string;
  name: string;
  email: string;
  registration_number: string;
  department: string;
  phone: string | null;
  bio: string | null;
  profile_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  personal_info: PersonalInfo | null;
};
