
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../shared/services/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; 


describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['SignUp']);

    TestBed.configureTestingModule({
      declarations: [SignUpComponent],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
      imports: [MatSlideToggleModule],
    });

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('onSignUp should call SignUp with correct values when all required fields are filled', () => {
    component.firstName = 'John';
    component.lastName = 'Doe';
    component.email = 'john.doe@example.com';
    component.phoneNumber = '1234567890';
    component.userPwd = 'password';
    component.isAdmin = true;
    component.onSignUp();
    expect(authService.SignUp).toHaveBeenCalledWith('john.doe@example.com', 'password', jasmine.objectContaining({
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      phoneNumber: '1234567890',
    }), 'admin');
  });

  it('onSignUp should log a message when required fields are not filled', () => {
    spyOn(console, 'log');
    component.onSignUp();
    expect(console.log).toHaveBeenCalledWith('Compila tutti i campi obbligatori');
  });

  it('toggleAdmin should toggle the value of isAdmin', () => {
    expect(component.isAdmin).toBe(false); 
    component.toggleAdmin(); 
    expect(component.isAdmin).toBe(true); 
    component.toggleAdmin(); 
    expect(component.isAdmin).toBe(false); 
  });
  
});
