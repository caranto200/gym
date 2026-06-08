import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenMensualComponent } from './resumen-mensual.component';

describe('ResumenMensualComponent', () => {
  let component: ResumenMensualComponent;
  let fixture: ComponentFixture<ResumenMensualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenMensualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenMensualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
