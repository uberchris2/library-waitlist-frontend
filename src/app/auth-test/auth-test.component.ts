import { Component } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-auth-test',
  template: `
    <div class="auth-test p-3 border rounded">
      <h6>Authentication Test</h6>
      <div *ngIf="user; else notSignedIn">
        <p class="text-success">✅ Signed in as: {{ user.email }}</p>
        <p><strong>User ID:</strong> {{ user.uid }}</p>
        <p><strong>Display Name:</strong> {{ user.displayName }}</p>
        <p><strong>Email Verified:</strong> {{ user.emailVerified }}</p>
        <button class="btn btn-sm btn-primary" (click)="testAuth()">Test Authentication</button>
      </div>
      <ng-template #notSignedIn>
        <p class="text-danger">❌ Not signed in</p>
        <button class="btn btn-sm btn-warning" (click)="signIn()">Sign In</button>
      </ng-template>
    </div>
  `,
  styles: [`
    .auth-test {
      background-color: #f8f9fa;
      margin: 10px 0;
    }
  `],
  standalone: true,
  imports: [NgIf]
})
export class AuthTestComponent {
  user: User | null = null;

  constructor(private auth: Auth) {
    user(this.auth).subscribe(u => {
      this.user = u;
    });
  }

  testAuth() {
    if (this.user) {
      console.log('Current user token:', this.user);
      this.auth.currentUser?.getIdToken().then(token => {
        console.log('ID Token:', token ? 'Present' : 'Missing');
      }).catch(err => {
        console.error('Error getting token:', err);
      });
    }
  }

  signIn() {
    // This will trigger the automatic sign-in in app.component.ts
    console.log('Sign in requested');
  }
} 