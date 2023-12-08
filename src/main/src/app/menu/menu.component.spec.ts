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
    // Simula che AuthService.isAdmin restituisca true
    authService.isAdmin.and.returnValue(of(true));

    component.ngOnInit(); // Chiamiamo esplicitamente ngOnInit

    // Verifica che il metodo AuthService.isAdmin sia stato chiamato
    expect(authService.isAdmin).toHaveBeenCalled();

    // Verifica che isAdmin sia stato impostato su true
    expect(component.isAdmin).toBe(true);
  });

  it('should call AuthService.isAdmin and set isAdmin to false', () => {
    // Simula che AuthService.isAdmin restituisca false
    authService.isAdmin.and.returnValue(of(false));

    component.ngOnInit(); // Chiamiamo esplicitamente ngOnInit

    // Verifica che il metodo AuthService.isAdmin sia stato chiamato
    expect(authService.isAdmin).toHaveBeenCalled();

    // Verifica che isAdmin sia stato impostato su false
    expect(component.isAdmin).toBe(false);
  });

  it('should call SignOut on redirectToPage with page "sign-in"', () => {
    component.redirectToPage('sign-in');

    // Verifica che il metodo AuthService.SignOut sia stato chiamato
    expect(authService.SignOut).toHaveBeenCalled();
  });

  it('should navigate on redirectToPage with page other than "sign-in"', () => {
    const page = 'desired-page';
    component.redirectToPage(page);

    // Verifica che il metodo Router.navigate sia stato chiamato con l'URL corretto
    expect(router.navigate).toHaveBeenCalledWith([`/${page}`]);
  });
});
