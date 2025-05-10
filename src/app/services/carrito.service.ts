import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { InventarioService } from './inventario.service'; // Importa el servicio de inventario
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: Producto[] = [];
    private productosSubject = new BehaviorSubject<Producto[]>([]);
  

  constructor(private inventarioService: InventarioService) {}

  agregarProducto(producto: Producto): void {
    // Verifica si el producto ya está en el carrito
    const productoEnCarrito = this.carrito.find((p) => p.id === producto.id);
    if (productoEnCarrito) {
      // Si ya está, aumenta la cantidad
      productoEnCarrito.cantidad += 1;
    } else {
      // Si no está, agrégalo al carrito con cantidad 1
      this.carrito.push({ ...producto, cantidad: 1 });
    }
  }

  obtenerCarrito(): Producto[] {
    return this.carrito;
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.productosSubject.next([]);
  }

  actualizarCantidad(productoId: number, nuevaCantidad: number): boolean {
    const productoEnCarrito = this.carrito.find((p) => p.id === productoId);
    if (productoEnCarrito) {
      // Obtén el stock disponible del inventario
      const productoEnInventario = this.inventarioService.obtenerProductoPorId(productoId);
      if (productoEnInventario && nuevaCantidad <= productoEnInventario.cantidad && nuevaCantidad > 0) {
        productoEnCarrito.cantidad = nuevaCantidad;
        return true; // Actualización exitosa
      }
    }
    return false; // No se pudo actualizar
  }

  eliminarProducto(index: number): void {
    this.carrito.splice(index, 1);
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find((p) => p.id === id);
  }

  generarXML(): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;
    xml += `  <Factura>\n`;
    xml += `    <Encabezado>\n`;
    xml += `      <Emisor>\n`;
    xml += `        <Nombre>Nombre de la empresa</Nombre>\n`;
    xml += `        <RFC>12345678</RFC>\n`;
    xml += `        <Domicilio>Ceti Colomos #12</Domicilio>\n`;
    xml += `      </Emisor>\n`;
    xml += `      <Receptor>\n`;
    xml += `        <Nombre>Paola Ponce</Nombre>\n`;
    xml += `      </Receptor>\n`;
    xml += `      <Fecha>2021-10-12</Fecha>\n`;
    xml += `      <NumFactura>19011901</NumFactura>\n`;
    xml += `    </Encabezado>\n`;
    xml += `    <Detalles>\n`;
    this.carrito.forEach((producto) => {
      xml += `        <producto>\n`;
      xml += `          <id>${producto.id}</id>\n`;
      xml += `          <nombre>${producto.nombre}</nombre>\n`;
      xml += `          <precio>${producto.precioP}</precio>\n`;
      xml += `          <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `        </producto>\n`;
    });
    xml += `    </Detalles>\n`;

    let subtotal = this.carrito.reduce((sum, producto) => sum + Number(producto.precioP) * producto.cantidad, 0);
    let iva = subtotal * 0.16;
    let total = subtotal + iva;
    
    xml += `    <Totales>\n`;
    xml += `      <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;
    xml += `      <iva>${iva.toFixed(2)}</iva>\n`;
    xml += `      <total>${total.toFixed(2)}</total>\n`;
    xml += `    </Totales>\n`;
    xml += `  </Factura>\n`;
    xml += `</recibo>`;
  
    return xml;
  }

  descargarXML(xml: string): void {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}