

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | UrlTree | boolean {
    return this.authService.isAdmin().pipe(
      map((isAdmin) => {
        if (isAdmin) {
          return true; // L'amministratore può accedere a tutte le pagine
        } else {
          if (next.url[0].path === 'statistics') {
            // L'utente normale non può accedere alla pagina "statistics"
            this.router.navigate(['home']);
            console.log('redirect to Home because it is not an administrator');
            return false;
          } else {
            return true;
          }
        }
      })
    );
  }
}
