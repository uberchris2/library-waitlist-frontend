import { CollectionReference, DocumentData, doc, setDoc } from "@angular/fire/firestore";
import { WaitHold } from "./wait-hold";

export class HoldHelpers {

  public static updateWaitHold(waitHoldCollection: CollectionReference, categoriesCollection: CollectionReference, waitHold: WaitHold) {
    const waitHoldReference = doc(waitHoldCollection, waitHold.id);
    waitHold.updated = new Date();
    return setDoc(waitHoldReference, waitHold);
  }
}
