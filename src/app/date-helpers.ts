import { environment } from 'src/environments/environment';

export class DateHelpers {

/**
 * Holds are held for two open library days.
 * eg. If the hold starts monday it is expires wednesday.
 * @returns the date 
 */
public static getExpirationDate(): Date {
  const holdShifts = 2; // Number of open days to add
  let expirationDate = new Date();
  let added = 0;

  while (added < holdShifts) {
    expirationDate.setDate(expirationDate.getDate() + 1);
    if (DateHelpers.isLibraryOpen(expirationDate.getDay())) {
      added++;
    }
  }
  return expirationDate;
}

  //returns whether or not the library is open on a given day
  public static isLibraryOpen(dow: number):boolean {
     // days the library is open
    // array of numbers 0-6
    // sunday = 0, monday = 1, etc.
    return environment.openDays.includes(dow);
  }
}
