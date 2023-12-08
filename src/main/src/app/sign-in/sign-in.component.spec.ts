import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignInComponent } from './sign-in.component';
import { AuthService } from '../shared/services/auth.service';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['SignIn']);
    
    TestBed.configureTestingModule({
      declarations: [SignInComponent],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('signInOnEnter should call SignIn with correct values', () => {
    component.userNameValue = 'testUsername';
    component.userPasswordValue = 'testPassword';

    component.signInOnEnter();

    // Verifica che il metodo SignIn dell'authService sia stato chiamato con i valori corretti
    expect(authService.SignIn).toHaveBeenCalledWith('testUsername', 'testPassword');
  });
});
