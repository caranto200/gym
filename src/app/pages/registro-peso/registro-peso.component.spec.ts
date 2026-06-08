import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPesoComponent } from './registro-peso.component';

describe('RegistroPesoComponent', () => {
  let component: RegistroPesoComponent;
  let fixture: ComponentFixture<RegistroPesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
