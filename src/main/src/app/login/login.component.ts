import { Component } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    
    if (this.username === "utente" && this.password === "milka") {
      console.log('Username:', this.username); // Stampa il valore di this.username nella console
      console.log('Password:', this.password); // Stampa il valore di this.password nella console
      this.router.navigate(['home']); // Reindirizza all'home page
    } else {
      alert("Credenziali errate. Riprova.");
    }
  }

}
