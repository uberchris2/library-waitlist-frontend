import { DocumentData } from "@angular/fire/firestore";
import { map } from "rxjs";
import { WaitHold } from "./wait-hold";

export class RxHelpers {
  private static mapDocData = (docData: DocumentData) => {
    docData['updated'] = docData['updated']?.toDate();
    docData['created'] = docData['created']?.toDate();
    if (docData['holdExpiration'] != null)
      docData['holdExpiration'] = docData['holdExpiration']?.toDate();
    return docData as WaitHold;
  }

  public static fixWaitHoldDates = map((docDataArr: DocumentData[]) => docDataArr.map(RxHelpers.mapDocData));

  public static fixWaitHoldDate = map(RxHelpers.mapDocData);
  
}
