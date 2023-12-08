import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../shared/services/auth.service';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['SignIn']);

    TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [{provide: AuthService, useValue: authService }]
    });
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
