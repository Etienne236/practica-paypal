import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:3000/productos'; // Endpoint de JSON Server
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarProductosDesdeBackend().subscribe({
      next: (productos) => {
        this.productosSubject.next(productos); // Actualiza el BehaviorSubject
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  private cargarProductosDesdeBackend(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error al cargar productos:', error);
        return of([]); // Retorna un arreglo vacío en caso de error
      })
    );
  }

  obtenerProductos(): Observable<Producto[]> {
    return this.productos$; // Retorna el Observable del BehaviorSubject
  }

  agregarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto).pipe(
      map((nuevoProducto) => {
        const productosActuales = this.productosSubject.value;
        this.productosSubject.next([...productosActuales, nuevoProducto]); // Actualiza el BehaviorSubject
        return nuevoProducto;
      }),
      catchError((error) => {
        console.error('Error al agregar producto:', error);
        throw error;
      })
    );
  }

  modificarProducto(id: number, productoActualizado: Producto): Observable<Producto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Producto>(url, productoActualizado).pipe(
      map((producto) => {
        const productosActuales = this.productosSubject.value;
        const index = productosActuales.findIndex(p => p.id === id);
        if (index !== -1) {
          productosActuales[index] = producto;
          this.productosSubject.next([...productosActuales]); // Actualiza el BehaviorSubject
        }
        return producto;
      }),
      catchError((error) => {
        console.error('Error al modificar producto:', error);
        throw error;
      })
    );
  }

  eliminarProducto(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => {
        const productosActuales = this.productosSubject.value.filter(p => p.id !== id);
        this.productosSubject.next([...productosActuales]); // Actualiza el BehaviorSubject
      }),
      catchError((error) => {
        console.error('Error al eliminar producto:', error);
        throw error;
      })
    );
  }

  obtenerProductoPorId(id: number): Producto | undefined {
    return this.productosSubject.value.find((p) => p.id === id);
  }
}