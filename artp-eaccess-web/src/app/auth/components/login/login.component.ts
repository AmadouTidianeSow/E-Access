// src/app/auth/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserProfile } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],  // ajoutez la référence au style
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,      // rendu public pour pouvoir router dans template
    public router: Router,         // rendu public pour bouton retour
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit() {
    this.error = null;
    if (this.loginForm.invalid) return;
    this.auth
      .login(this.loginForm.value)
      .subscribe({
        next: () => {
          this.auth.profile$.subscribe((user: UserProfile | null) => {
            if (!user) return;
            switch (user.role) {
              case 'admin':
                this.router.navigate(['/admin/home']);
                break;
              case 'agent':
                this.router.navigate(['/agent/pending']);
                break;
              case 'employe':
                this.router.navigate(['/employe/home']);
                break;
            }
          });
        },
        error: err => {
          this.error = 'Échec de la connexion';
          console.error(err);
        },
      });
  }
}
