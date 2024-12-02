import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegPedidoComponent } from './seg-pedido.component';

describe('SegPedidoComponent', () => {
  let component: SegPedidoComponent;
  let fixture: ComponentFixture<SegPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SegPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
