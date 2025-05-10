import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { Producto } from '../../models/producto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule], // Agrega CommonModule aquí
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  nuevoProducto: Producto = {
    id: 0, // JSON Server generará automáticamente el ID
    nombre: '',
    precioP: 0,
    imagen: '',
    cantidad: 0
  };
  productoSeleccionado: Producto | null = null; // Permite null

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.inventarioService.obtenerProductos().subscribe((productos) => {
      this.productos = productos;
    });
  }

  agregarProducto(): void {
    this.inventarioService.agregarProducto(this.nuevoProducto).subscribe(() => {
      this.nuevoProducto = { id: 0, nombre: '', precioP: 0, imagen: '', cantidad: 0 }; // Reinicia el formulario
      this.cargarProductos(); // Recarga la lista de productos
    });
  }

  editarProducto(producto: Producto): void {
    this.productoSeleccionado = { ...producto }; // Clona el producto para editar
  }

  guardarCambios(): void {
    if (this.productoSeleccionado) { // Verifica que productoSeleccionado no sea null
      this.inventarioService.modificarProducto(this.productoSeleccionado.id, this.productoSeleccionado).subscribe(() => {
        this.productoSeleccionado = null; // Ahora es válido porque permite null
        this.cargarProductos(); // Recarga la lista de productos
      });
    }
  }

  cancelarEdicion(): void {
    this.productoSeleccionado = null; // Ahora es válido porque permite null
  }

  eliminarProducto(id: number): void {
    this.inventarioService.eliminarProducto(id).subscribe(() => {
      this.cargarProductos(); // Recarga la lista de productos
    });
  }
}