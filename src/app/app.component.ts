import { Component } from '@angular/core';
import { Auth, signInWithRedirect, user, User } from '@angular/fire/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  isNavbarCollapsed = true;
  user: User | undefined | null;
  public environment = environment;

  constructor(private auth: Auth) {
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    var user$ = user(auth);
    user$.subscribe(u => {
      this.user = u;
      if (u == null) {
        var provider = new GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/cloud-platform");
        provider.addScope("https://www.googleapis.com/auth/datastore");
        var auth = getAuth();
        isFirefox || !environment.production ? signInWithPopup(auth, provider) : signInWithRedirect(auth, provider);
      }
    });
  }

  logout() {
    this.auth.signOut();
  }

}
