
export class DateHelpers {
  // days the library is open
  // array of numbers 0-6
  // sunday = 0, monday = 1, etc.
  private static openDays = [0, 2, 4, 6];

  public static getExpirationDate() {
    var today = new Date().getDay();
    var advanceDays = 0;
    const openDays = DateHelpers.openDays.sort();
    for (var openDay of openDays) {
      if (openDay > today) {
        advanceDays = openDay - today;
        break;
      }
    }
    if (advanceDays == 0) { //if it is currently past the last open day of the week
      advanceDays = 7 - today + openDays[0];
    }

    var expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + advanceDays);
    return expirationDate;
  }
}
