import { Component } from '@angular/core';
import { Auth, signInWithRedirect, user, User } from '@angular/fire/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  isNavbarCollapsed = true;
  user: User | undefined | null;

  constructor(private auth: Auth) {
    var user$ = user(auth);
    user$.subscribe(u => {
      this.user = u;
      if (u == null) {
        var provider = new GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/cloud-platform");
        provider.addScope("https://www.googleapis.com/auth/datastore");
        var auth = getAuth();
        signInWithRedirect(auth, provider);
      }
    });
  }

  logout() {
    this.auth.signOut();
  }

}
