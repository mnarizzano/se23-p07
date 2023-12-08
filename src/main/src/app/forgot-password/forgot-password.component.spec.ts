import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../shared/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: AuthService;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['someAuthServiceMethod']);

    TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject the AuthService', () => {
    expect(component.authService).toBe(authService);
  });

  it('should call ngOnInit without errors', () => {
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

});
