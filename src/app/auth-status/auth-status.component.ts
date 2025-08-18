import { Component } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-status',
  template: `
    <div class="auth-status" *ngIf="user">
      <small class="text-success">
        ✅ Signed in as: {{ user.email }}
      </small>
    </div>
    <div class="auth-status" *ngIf="!user">
      <small class="text-danger">
        ❌ Not signed in
      </small>
    </div>
  `,
  styles: [`
    .auth-status {
      padding: 8px;
      margin: 8px 0;
      border-radius: 4px;
      background-color: #f8f9fa;
    }
  `],
  standalone: true,
  imports: [NgIf]
})
export class AuthStatusComponent {
  user: User | null = null;

  constructor(private auth: Auth) {
    user(this.auth).subscribe(u => {
      this.user = u;
    });
  }
} 