import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { of } from 'rxjs';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    authService = jasmine.createSpyObj('AuthService', ['isAdmin', 'SignOut']);
    
    TestBed.configureTestingModule({
      declarations: [MenuComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    });

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.isAdmin and set isAdmin to true', () => {
    authService.isAdmin.and.returnValue(of(true));
    component.ngOnInit(); 
    expect(authService.isAdmin).toHaveBeenCalled();
    expect(component.isAdmin).toBe(true);
  });

  it('should call AuthService.isAdmin and set isAdmin to false', () => {
    authService.isAdmin.and.returnValue(of(false));
    component.ngOnInit(); 
    expect(authService.isAdmin).toHaveBeenCalled();
    expect(component.isAdmin).toBe(false);
  });

  it('should call SignOut on redirectToPage with page "sign-in"', () => {
    component.redirectToPage('sign-in');
    expect(authService.SignOut).toHaveBeenCalled();
  });

  it('should navigate on redirectToPage with page other than "sign-in"', () => {
    const page = 'desired-page';
    component.redirectToPage(page);
    expect(router.navigate).toHaveBeenCalledWith([`/${page}`]);
  });
});
