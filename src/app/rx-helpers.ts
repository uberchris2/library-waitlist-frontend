import { DocumentData } from "@angular/fire/firestore";
import { map } from "rxjs";
import { WaitHold } from "./wait-hold";

export class RxHelpers {
  public static fixWaitHoldDates = map((docDataArr: DocumentData[]) => docDataArr.map(docData => {
    docData['updated'] = docData['updated']?.toDate();
    docData['created'] = docData['created']?.toDate();
    if (docData['holdExpiration'] != null)
      docData['holdExpiration'] = docData['holdExpiration']?.toDate();
    return docData as WaitHold;
  }));
}
