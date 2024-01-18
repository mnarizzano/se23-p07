import { TestBed } from '@angular/core/testing';
import { UserDataService } from './user-data.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../../../environments/environment';

describe('UserDataService', () => {
  let service: UserDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserDataService, AngularFirestore],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig), 
      ],
    });
    service = TestBed.inject(UserDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve user data', (done) => {
    const userId = 'tOh3pvyOtRPpgjw4SpISdENkkXl1'; 
  
    service.getUserData(userId).subscribe((userData) => {
      expect(userData).toBeDefined();
      done();
    });
  });
  
});

  
  

