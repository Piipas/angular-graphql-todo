import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-delete-task-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatDialogModule, CommonModule, MatButtonModule],
  templateUrl: './delete-task-dialog.component.html',
  styleUrl: './delete-task-dialog.component.css',
})
export class DeleteTaskDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { id: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(this.data.id);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
