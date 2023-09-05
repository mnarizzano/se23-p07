export class User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;

  constructor() {
    this.uid = '';
    this.email = null;
    this.displayName = null;
    this.photoURL = null;
    this.phoneNumber = null;
  }
}
