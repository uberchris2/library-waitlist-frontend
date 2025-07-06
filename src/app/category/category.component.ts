import { Component } from '@angular/core';
import { Firestore, collectionData, collection, CollectionReference, query, where } from '@angular/fire/firestore';
import { EMPTY, Observable, Subscription, map } from 'rxjs';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WaitHold } from '../wait-hold';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { RxHelpers } from '../rx-helpers';
import { DateHelpers } from '../date-helpers';
import { HoldHelpers } from '../hold-helpers';
import { ClipboardModule } from 'ngx-clipboard';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { EmailService } from '../email.service';
import { EmailPreviewComponent, EmailData } from '../email-preview/email-preview.component';
import { AuthStatusComponent } from '../auth-status/auth-status.component';
import { AuthTestComponent } from '../auth-test/auth-test.component';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css'],
    standalone: true,
    imports: [RouterLink, NgbPopover, NgIf, NgFor, ClipboardModule, AsyncPipe, DatePipe]
})
export class CategoryComponent {
  waitHold$: Observable<WaitHold[]> = EMPTY;
  waitHoldCollection: CollectionReference;
  categoriesCollection: CollectionReference;
  categoryId = "";
  today = new Date();
  subscriptions: Subscription[] = [];
  
  // Remove emailPreview and emailPreviewComponent properties
  selectedWaitHold: WaitHold | null = null;
  canPreviewEmail = false;

  constructor(
    private firestore: Firestore, 
    private route: ActivatedRoute,
    private emailService: EmailService,
    private modalService: NgbModal // <-- add this
  ) {
    this.waitHoldCollection = collection(firestore, 'wait-holds');
    this.categoriesCollection = collection(firestore, 'categories');
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe((params: ParamMap) => {
      this.categoryId = String(params.get('categoryId'));
      const whQuery = query(this.waitHoldCollection,
        where("category", "==", this.categoryId),
        where("status", "in", ["Waiting", "Holding"]));
      this.waitHold$ = (collectionData(whQuery, { idField: "id" }) as Observable<WaitHold[]>).pipe(
        RxHelpers.fixWaitHoldDates,
        map(wha => wha.sort((wh1, wh2) => {
          if (wh1.status != wh2.status) {
            return wh1.status == 'Waiting' ? 1 : -1;
          }
          if (wh1.created != wh2.created) {
            return wh1.created > wh2.created ? 1 : -1;
          }
          return 0;
        }))
      );
    }));
    // Check if sendEmail is available
    this.emailService.isSendEmailAvailable().then(available => {
      this.canPreviewEmail = available;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  startHold(waitHold: WaitHold) {
    // Update the hold status first
    waitHold.status = "Holding";
    waitHold.holdExpiration = DateHelpers.getExpirationDate();
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
    // Then open the email preview modal
    this.canPreviewEmail &&this.previewHoldNotificationEmail(waitHold);
  }

  previewHoldNotificationEmail(waitHold: WaitHold) {
    this.selectedWaitHold = waitHold;
    const emailPreview: EmailData = {
      to: waitHold.email,
      subject: `Hold for ${waitHold.tool} in ${waitHold.category}`,
      body: `Hello ${waitHold.name},\n\nYou have a hold for ${waitHold.tool} in ${waitHold.category}.\n\nThank you,\nTool Library Team`
    };

    const modalRef = this.modalService.open(EmailPreviewComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.emailData = emailPreview;
    modalRef.componentInstance.title = 'Preview Hold Notification Email';
    modalRef.componentInstance.sendEmail.subscribe((emailData: EmailData) => {
      this.onSendEmail(emailData);
      modalRef.close();
    });
    modalRef.componentInstance.cancel.subscribe(() => {
      this.onCancelEmail();
      modalRef.close();
    });
  }

  async onSendEmail(emailData: EmailData) {
    if (!this.selectedWaitHold) return;
    
    try {
      // Send email with custom content first
      const result = await this.emailService.sendEmail(emailData);
      
      if (result.success) {
        console.log('Email sent successfully:', result.messageId);
        
        // Update the hold status only after successful email
        this.selectedWaitHold.status = "Holding";
        this.selectedWaitHold.holdExpiration = DateHelpers.getExpirationDate();
        HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, this.selectedWaitHold);
        
        // Show success message
        alert('Email sent successfully! Hold has been started.');
      } else {
        // Show error message
        alert(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('An unexpected error occurred while sending the email.');
    }
  }

  onCancelEmail() {
    // Reset selected wait hold
    this.selectedWaitHold = null;
  }

  cancelWaitHold(waitHold: WaitHold) {
    const wasHold = waitHold.status == "Holding";
    waitHold.status = "Cancelled";
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }

  demoteHold(waitHold: WaitHold) {
    const wasHold = waitHold.status == "Holding";
    waitHold.status = "Waiting";
    waitHold.created = new Date();
    waitHold.holdExpiration = null;
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }

  pickupHold(waitHold: WaitHold) {
    waitHold.status = "Completed";
    HoldHelpers.updateWaitHold(this.waitHoldCollection, this.categoriesCollection, waitHold);
  }
}
