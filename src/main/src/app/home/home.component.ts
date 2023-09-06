import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  isAdmin = false;
constructor(public authService: AuthService) {}
  ngOnInit(): void {
    // Controlla che l'utente sia un amministratore
      this.authService.isAdmin().subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      });
  }
}
