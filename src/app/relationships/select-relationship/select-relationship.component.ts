import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  dtoIdNameConfig,
  getDtoLabelAndIconById,
  getRelationshipListByDtoId,
} from '../reationshipConfig';

@Component({
  selector: 'app-select-relationship',
  templateUrl: './select-relationship.component.html',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
})
export class SelectRelationshipComponent {
  itemsData: dtoIdNameConfig[] = [];
  dtoId: string = '';
  Id: string = '';
  ModelData: any;
  header: any;
  submitted: boolean = false;
  selecteddto: { label?: string; icon?: string } | undefined;
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.config.data) {
      this.dtoId = this.config.data.dtoId;
      this.Id = this.config.data.id;
      this.InitializeData(this.dtoId);
      const keys = Object.keys(this.config.data);
      this.header = keys[0];
      const firstKeyValue = this.config.data[this.header];
      this.ModelData = firstKeyValue;
    }
  }

  CloseInstances() {
    this.ref.close({});
    this.submitted = false;
  }

  InitializeData(dtoId: string) {
    this.dtoId = dtoId;
    this.itemsData = getRelationshipListByDtoId(dtoId) || [];
    this.selecteddto = getDtoLabelAndIconById(dtoId);
  }

  visit(itemName: string) {
    this.router.navigate([itemName.toLowerCase()], {
      queryParams: { id: this.dtoId, primarykey: this.Id },
    });
    this.CloseInstances();
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
