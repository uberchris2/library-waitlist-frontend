import { CollectionReference, DocumentData, doc, docData, setDoc } from "@angular/fire/firestore";
import { WaitHold } from "./wait-hold";
import { first } from "rxjs";
import { Category } from "./category";

export class HoldHelpers {

  public static updateWaitHold(waitHoldCollection: CollectionReference, categoriesCollection: CollectionReference, waitHold: WaitHold, waitIncrement: number, holdIncrement: number) {
    const waitHoldReference = doc<DocumentData>(waitHoldCollection, waitHold.id);
    waitHold.updated = new Date();
    return setDoc(waitHoldReference, waitHold).then(() => {
      const categoryReference = doc<DocumentData>(categoriesCollection, waitHold.category);
      docData(categoryReference).pipe(first()).subscribe(cat => {
        var updatedCategory = cat as Category;
        updatedCategory.holding = updatedCategory.holding + holdIncrement;
        updatedCategory.waiting = updatedCategory.waiting + waitIncrement;
        setDoc(categoryReference, updatedCategory);
      });
    });
  }
}
