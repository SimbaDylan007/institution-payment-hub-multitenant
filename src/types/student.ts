
export interface StudentRegistrationRequest {
  billerId: string;
  customerAccount: string;
  customerAccountDetails1: string;
  customerAccountDetails2: string;
  customerName: string;
}

export interface StudentRegistrationId {
  billerId: string;
  customerAccount: string;
}

export interface StudentRegistration {
  id: StudentRegistrationId;
  customerAccountDetails1: string;
  customerAccountDetails2: string;
  customerName: string;
}
