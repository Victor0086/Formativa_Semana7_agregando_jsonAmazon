import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-seg-pedido',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './seg-pedido.component.html',
  styleUrls: ['./seg-pedido.component.css'],
  providers: [JsonService],
})
export class SegPedidoComponent implements OnInit {
  email: string = 'elpandacomida@gmail.com';
  orders: any[] = []; // Todos los pedidos cargados
  searchResult: any[] = []; // Resultado de la búsqueda
  orderNumber: string = ''; // Número de seguimiento ingresado
  errorMessage: string = ''; // Mensaje de error
  isLoggedIn: boolean = false;
  username: string | null = null;
  cartCount: number = 0;

  constructor(private jsonService: JsonService, private router: Router) {}

  ngOnInit(): void {
    console.log('Cargando componente...');
    // No cargamos pedidos automáticamente
    this.checkUserSession();
    this.loadCartCount();
  }

  trackOrder(): void {
    console.log('Buscando pedido con número:', this.orderNumber);

    if (!this.orderNumber) {
      this.errorMessage = 'Por favor, ingresa un número de seguimiento válido.';
      this.searchResult = [];
      return;
    }

    // Cargar pedidos desde S3 y buscar el pedido específico
    this.jsonService.getCarritoData().subscribe({
      next: (data) => {
        console.log('Datos cargados desde S3:', data);
        this.orders = data;

        const order = this.orders.find(
          (o: any) => o.trackingNumber === this.orderNumber
        );

        if (order) {
          console.log('Pedido encontrado:', order);
          this.searchResult = [order];
          this.errorMessage = '';
        } else {
          console.warn('Pedido no encontrado.');
          this.searchResult = [];
          this.errorMessage = 'No se encontró un pedido con ese número.';
        }
      },
      error: (err) => {
        console.error('Error al cargar datos desde S3:', err);
        this.errorMessage = 'No se pudo cargar los datos desde el servidor.';
      },
    });
  }

  checkUserSession(): void {
    const storedUser = localStorage.getItem('userData');
    const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

    if (storedUser && sesionActiva) {
      const user = JSON.parse(storedUser);
      this.username = user.nombreCompleto || null;
      this.isLoggedIn = true;
      console.log('Sesión activa:', this.username);
    } else {
      this.username = null;
      this.isLoggedIn = false;
      console.log('No hay sesión activa.');
    }
  }

  loadCartCount(): void {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        this.cartCount = Array.isArray(parsedCart)
          ? parsedCart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
          : 0;
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cartCount = 0;
      }
    }
  }

  logout(): void {
    console.log('Cerrando sesión...');
    localStorage.setItem('sesionActiva', 'false');
    this.username = null;
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    console.log('Redirigiendo al perfil...');
    if (this.isLoggedIn) {
      this.router.navigate(['/user']);
    } else {
      alert('Por favor, inicie sesión primero.');
    }
  }
}
