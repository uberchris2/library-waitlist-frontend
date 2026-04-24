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


  get openDays(): number[] {
    return environment.openDays;
  }

  get headerClass(): string {
    return environment.headerClass;
  }

  get myTurnUrl(): string {
    return environment.myTurnUrl ?? '';
  }

  /** Full myTurn inventory URL, or null if host or id is not configured. */
  getMyTurnInventoryShowUrl(heldItemId: string | null | undefined): string | null {
    const host = (environment.myTurnUrl ?? '')
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/+$/, '');
    const id = (heldItemId ?? '').toString().trim();
    if (!host || !id) {
      return null;
    }
    return `https://${host}/library/inventory/show/${id}`;
  }
} 