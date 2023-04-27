import { Component } from '@angular/core';
import { CollectionReference, DocumentData, Firestore, collection, collectionData, deleteDoc, doc, writeBatch } from '@angular/fire/firestore';
import { NgxCSVParserError, NgxCsvParser } from 'ngx-csv-parser';
import { first } from 'rxjs';

@Component({
  selector: 'app-update-users',
  templateUrl: './update-users.component.html',
  styleUrls: ['./update-users.component.css']
})
export class UpdateUsersComponent {
  fileToUpload: File | null = null;
  currentState = "";
  progress = 0;

  constructor(private ngxCsvParser: NgxCsvParser, private firestore: Firestore) { }

  handleFileInput(event: any) {
    this.fileToUpload = event.files.item(0);
  }

  updateMembers() {
    if (!this.fileToUpload) return;
    this.updateProgress("Reading file", 5);

    this.ngxCsvParser
      .parse(this.fileToUpload, { header: true, delimiter: ',', encoding: 'utf8' })
      .subscribe({
        next: (result): void => {
          this.processUpdate(result as any[])
        },
        error: (error: NgxCSVParserError): void => {
          console.log('Error', error);
          this.updateProgress("Error");
        }
      });
  }

  private updateProgress(newState: string, newProgress?: number) {
    this.currentState = newState;
    if (newProgress != undefined) this.progress = newProgress;
  }

  private processUpdate(newMembers: any[]) {
    this.updateProgress("Checking file", 10);
    const badMembers = newMembers.filter(m => !m['First Name'] || !m['Last Name'] || !m['Email']);
    if (badMembers.length > 0 || newMembers.length == 0) {
      this.updateProgress("Error");
      console.log("Invalid or no members")
      console.log(badMembers);
      return;
    }
    this.updateProgress("Preparing list", 12);
    newMembers = newMembers.map(m => ({ name: m['First Name'] + ' ' + m['Last Name'], email: m['Email']}));
    this.updateProgress("Removing old member list", 15);

    var membersCollection = collection(this.firestore, 'members');
    collectionData(membersCollection, { idField: "id" }).pipe(first())
      .subscribe(oldMembers => {
        if (oldMembers.length) {
          this.deleteMember(membersCollection, oldMembers)
        }
        this.updateProgress("Importing new member list", 50);
        this.addMembers(membersCollection, newMembers);
      });
  }

  private deleteMember(membersCollection: CollectionReference, oldMembers: any[]) {
    var member = oldMembers.pop();
    if (member == undefined) return;
    var categoryReference = doc<DocumentData>(membersCollection, member['id']);
    deleteDoc(categoryReference).then(() => {
      this.deleteMember(membersCollection, oldMembers);
    });
  }

  private addMembers(membersCollection: CollectionReference, newMembers: any[]) {
    if (newMembers.length == 0) {
      this.updateProgress("Done", 100);
      return;
    }
    var batch = writeBatch(this.firestore);
    for (var i = 0; i < 250; i++) {
      var newMember = newMembers.shift();
      if (newMember == undefined) break;
      batch.set(doc(membersCollection), newMember);
    }
    batch.commit().then(() => this.addMembers(membersCollection, newMembers));
  }
}

