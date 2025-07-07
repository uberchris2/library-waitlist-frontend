import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  get siteName(): string {
    return environment.siteName;
  }

  get isProduction(): boolean {
    return environment.production;
  }

  get isEmulated(): boolean {
    return environment.emulated;
  }

  get openDays(): number[] {
    return environment.openDays;
  }

  get headerClass(): string {
    return environment.headerClass;
  }
} 