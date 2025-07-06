import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgIf } from '@angular/common';
import { AuthStatusComponent } from '../auth-status/auth-status.component';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

@Component({
  selector: 'app-email-preview',
  templateUrl: './email-preview.component.html',
  styleUrls: ['./email-preview.component.css'],
  standalone: true,
  imports: [FormsModule, NgIf, AuthStatusComponent]
})
export class EmailPreviewComponent {
  @Input() emailData: EmailData = {
    to: '',
    subject: '',
    body: ''
  };
  
  @Input() title: string = 'Preview Email';
  @Input() showFromField: boolean = false;
  
  @Output() sendEmail = new EventEmitter<EmailData>();
  @Output() cancel = new EventEmitter<void>();

  private modalRef: NgbModalRef | null = null;

  constructor(private modalService: NgbModal) {}

  openModal(): void {
    this.modalRef = this.modalService.open(this, { 
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
  }

  onSendEmail(): void {
    this.sendEmail.emit(this.emailData);
    this.modalRef?.close();
  }

  onCancel(): void {
    this.cancel.emit();
    this.modalRef?.close();
  }
} 