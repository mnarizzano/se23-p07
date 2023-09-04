import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service'; 

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  constructor(private router: Router, private authService: AuthService) {}

  redirectToPage(page: string) {
    if (page === 'sign-in') {
      // Esegui il logout dell'utente quando si fa clic su "Logout"
      this.authService.SignOut();
    } else {
      // Altrimenti, navighiamo verso la pagina desiderata
      this.router.navigate(['/' + page]);
    }
  }
}
