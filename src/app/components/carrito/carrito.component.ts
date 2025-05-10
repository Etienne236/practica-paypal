
import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto';
import { ICreateOrderRequest, IPayPalConfig, NgxPayPalModule } from 'ngx-paypal';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, NgxPayPalModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Producto[] = [];
  pagoExitoso: boolean = false;
  subtotalP: number = 0;
  ivaP: number = 0;
  totalP: number = 0;
  items: {
    name: string;
    quantity: string;
    category: string;
    unit_amount: {
        currency_code: string;
        value: string;
    };
  }[] = [];

  constructor(private carritoService: CarritoService) {}

  public payPalConfig ? : IPayPalConfig;

  private initConfig(): void {
    let subtotal = this.carrito.reduce((sum, producto) => sum + (producto.precioP * producto.cantidad), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;
    this.subtotalP = subtotal;
    this.ivaP = iva;
    this.totalP = total;

    // Crear los items para PayPal
    const items = this.carrito.map(producto => ({
      name: producto.nombre,
      quantity: producto.cantidad.toString(),
      category: 'DIGITAL_GOODS', // Cambia a DIGITAL_GOODS si es apropiado
      unit_amount: {
        currency_code: 'MXN',
        value: isNaN(producto.precioP) ? '0.00' : producto.precioP.toFixed(2),
      },
    }));
    this.items = items;

    this.payPalConfig = {
        currency: 'MXN',
        clientId: 'AbNM19B2Lzyg3TRbupFMfG5uqUycqNGW8he5Q3Z0WKJsYe9DEhHeS1iIRWJjHiTQlocHwXGb1QiYw0wc',
        createOrderOnClient: (data) => < ICreateOrderRequest > {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'MXN',
                    value: this.totalP.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: 'MXN',
                        value: this.subtotalP.toFixed(2)
                      },
                      tax_total: {
                        currency_code: 'MXN',
                        value: this.ivaP.toFixed(2)
                      }
                    }
                },
                items: this.items
            }]
        },
        advanced: {
            commit: 'true'
        },
        style: {
            label: 'paypal',
            layout: 'vertical',
            color: 'blue',
            shape: 'rect'
        },
        onApprove: (data, actions) => {
            console.log('onApprove - transaction was approved, but not authorized', data, actions);
            actions.order.get().then((details: any) => {
                console.log('onApprove - you can get full order details inside onApprove: ', details);

                // Aquí podrías llamar a tu servicio para generar el XML
                const xml = this.carritoService.generarXML();
                this.carritoService.descargarXML(xml);

                this.pagoExitoso = true;
                
                // Limpiar el carrito después del pago exitoso
                this.carritoService.limpiarCarrito();
                this.carrito = [];
            });

        },
        onClientAuthorization: (data) => {
            console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        },
        onCancel: (data, actions) => {
            console.log('OnCancel', data, actions);

        },
        onError: err => {
            console.log('OnError', err);
        },
        onClick: (data, actions) => {
            console.log('onClick', data, actions);
        }
    };
  }

  ngOnInit(): void {
    this.carrito = this.carritoService.obtenerCarrito();
    this.initConfig();
  }

  eliminarProducto(index: number): void {
    this.carritoService.eliminarProducto(index);
    let subtotal = this.carrito.reduce((sum, producto) => sum + (producto.precioP * producto.cantidad), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;
    this.subtotalP = subtotal;
    this.ivaP = iva;
    this.totalP = total;
    const items = this.carrito.map(producto => ({
      name: producto.nombre,
      quantity: producto.cantidad.toString(),
      category: 'DIGITAL_GOODS', // Cambia a DIGITAL_GOODS si es apropiado
      unit_amount: {
        currency_code: 'MXN',
        value: isNaN(producto.precioP) ? '0.00' : producto.precioP.toFixed(2),
      },
    }));
    this.items = items;
  }

  actualizarCantidad(productoId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const nuevaCantidad = parseInt(input.value, 10);

    if (this.carritoService.actualizarCantidad(productoId, nuevaCantidad)) {
      // Actualización exitosa
      console.log('Cantidad actualizada');
    } else {
      // Restaura el valor anterior si la actualización falla
      const producto = this.carrito.find((p) => p.id === productoId);
      if (producto) {
        input.value = producto.cantidad.toString();
      }
      alert('No hay suficiente stock o la cantidad no es válida.');
    }

    let subtotal = this.carrito.reduce((sum, producto) => sum + (producto.precioP * producto.cantidad), 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;
    this.subtotalP = subtotal;
    this.ivaP = iva;
    this.totalP = total;
    const items = this.carrito.map(producto => ({
      name: producto.nombre,
      quantity: producto.cantidad.toString(),
      category: 'DIGITAL_GOODS', // Cambia a DIGITAL_GOODS si es apropiado
      unit_amount: {
        currency_code: 'MXN',
        value: isNaN(producto.precioP) ? '0.00' : producto.precioP.toFixed(2),
      },
    }));
    this.items = items;
  }

  generarDescargarXML(): void {
    const xml = this.carritoService.generarXML();
    this.carritoService.descargarXML(xml);
  }
}