import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalDataComponent } from './personal-data.component';
import { UserDataService } from '../shared/services/user-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { of } from 'rxjs';
import { AppModule } from '../app.module';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;
  let userDataService: jasmine.SpyObj<UserDataService>;
  let afAuth: jasmine.SpyObj<AngularFireAuth>;
  let firestore: jasmine.SpyObj<AngularFirestore>;

  beforeEach(() => {
    userDataService = jasmine.createSpyObj('UserDataService', ['getUserData']);
    afAuth = jasmine.createSpyObj('AngularFireAuth', ['authState']);
    firestore = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc']);

    TestBed.configureTestingModule({
      declarations: [PersonalDataComponent],
      providers: [
      ],
      imports: [AppModule],
    });

    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateInfo', () => {
    component.updateInfo();
    expect(component.editingAddress).toBe(true);
    expect(component.editingPhoneNumber).toBe(true);
    expect(component.editedAddress).toEqual(component.userData.address);
    expect(component.editedPhoneNumber).toEqual(component.userData.phoneNumber);
  });

  it('should save edited address - DA FINIRE', () => {
    component.saveEditedAddress();
    expect(component.userData.address).toBe(component.editedAddress);
    expect(component.editingAddress).toBe(false);

    // da continuare
  });


});



/*
  it('should fetch user data on initialization', () => {
    const userData = { address: 'Sample Address', phoneNumber: '1234567890' };
    const authState = { uid: 'sampleUserId' };
    const afAuthSpy = jasmine.createSpyObj('afAuth', ['authState']);
    afAuthSpy.authState = of(authState);
  
    spyOn(userDataService, 'getUserData').and.returnValue(of(userData));
  
    fixture.detectChanges();
  
    expect(afAuthSpy.authState).toHaveBeenCalled();
    expect(userDataService.getUserData).toHaveBeenCalledWith(authState.uid);
    component.ngOnInit(); 
    expect(component.userData).toEqual(userData);
  });

  it('should update address', () => {
    component.editedAddress = 'New Address';
    component.saveEditedAddress();

    const authState = { uid: 'sampleUserId' };
    (afAuth.authState as jasmine.Spy).and.returnValue(of(authState));
    (firestore.collection as jasmine.Spy).and.returnValue({
      doc: (docId: string) => ({
        update: (data: any) => {
          expect(docId).toBe(authState.uid);
          expect(data).toEqual({ address: 'New Address' });
        },
      }),
    });

    component.saveEditedAddress();
  });
  
 

  

  it('should update phone number', () => {
    component.editedPhoneNumber = 'New Phone Number';
    component.saveEditedPhoneNumber();

    const authState = { uid: 'sampleUserId' };
    (afAuth.authState as jasmine.Spy).and.returnValue(of(authState));
    (firestore.collection as jasmine.Spy).and.returnValue({
      doc: (docId: string) => ({
        update: (data: any) => {
          expect(docId).toBe(authState.uid);
          expect(data).toEqual({ phoneNumber: 'New Phone Number' });
        },
      }),
    });

    component.saveEditedPhoneNumber();
  });


});
*/