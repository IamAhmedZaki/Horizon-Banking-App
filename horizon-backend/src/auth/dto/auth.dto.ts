export interface SignUpDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address1?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  ssn?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}       