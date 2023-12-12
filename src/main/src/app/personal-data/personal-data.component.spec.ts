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

  it('should save edited address', () => {
    component.saveEditedAddress();
    expect(component.userData.address).toBe(component.editedAddress);
    expect(component.editingAddress).toBe(false);
  });

});

