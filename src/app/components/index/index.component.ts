import { Component, OnInit, OnDestroy, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterModule, CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit, OnDestroy {
  @ViewChild('logoutModal') logoutModal: ElementRef | undefined;

  email: string = 'elpandacomida@gmail.com';
  cartCount: number = 0;
  errorMessage: string = ''; 
  username: string | null = null;
  isLoggedIn: boolean = false;

  loginForm!: FormGroup;


  constructor(private router: Router, private el: ElementRef, private renderer: Renderer2, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('Inicializando componente SegPedido...');
    this.initLoginForm(); 
    this.checkUserSession();

    if (this.isBrowser()) {
      window.addEventListener('storage', this.syncLogout.bind(this)); 
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('storage', this.syncLogout.bind(this));
    }
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private checkUserSession(): void {
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem('userData');
      const sesionActiva = localStorage.getItem('sesionActiva') === 'true';

      if (storedUser && sesionActiva) {
        const user = JSON.parse(storedUser);
        this.username = user.nombreCompleto || null;
        this.isLoggedIn = true;
      } else {
        this.username = null;
        this.isLoggedIn = false;
      }

      console.log('Estado de sesión en seg-pedido:', { username: this.username, isLoggedIn: this.isLoggedIn });
    }
  }

  // Cargar datos del carrito
  private loadCartCount(): void {
    if (typeof localStorage !== 'undefined') {
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
  }

  // Agregar producto al carrito
  addToCart(product: any): void {
    if (typeof localStorage !== 'undefined') {
      let cart = localStorage.getItem('cart');
      let parsedCart = cart ? JSON.parse(cart) : [];
      const existingProduct = parsedCart.find((item: any) => item.id === product.id);

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        parsedCart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(parsedCart));
      this.cartCount += 1;
    }
  }

  // Redirigir al perfil del usuario
  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/user']);
    } else {
      alert('Por favor, inicie sesión primero.');
    }
  }

  

  // Iniciar sesión usando correo electrónico
  login(email: string, password: string): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.email === email && user.password === password) {
        this.username = user.nombreCompleto; 
        this.isLoggedIn = true;
        localStorage.setItem('sesionActiva', 'true');

        // Dispara manualmente el evento 'storage'
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          console.log('Evento de almacenamiento disparado manualmente.');
        }

        alert('Inicio de sesión exitoso');
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } else {
      alert('Usuario no encontrado');
    }
  }

  openModal(): void {
    if (this.isBrowser()) {
      const modal = new window.bootstrap.Modal(document.getElementById('orderModal'));
      modal.show();
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.setItem('sesionActiva', 'false');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('loggedInUser');
      this.username = null;
      this.isLoggedIn = false;
      window.dispatchEvent(new Event('storage'));
      alert('Sesión cerrada');
      this.router.navigate(['/']);
    }
  }
  

  // Sincronizar cierre de sesión entre pestañas
  private syncLogout(event: StorageEvent): void {
    if (event.key === 'sesionActiva') {
      const isActive = event.newValue === 'true';
      if (!isActive) {
        console.log('Sincronizando cierre de sesión');
        this.username = null;
        this.isLoggedIn = false;
      }
    }
  }

  // Verificar si el usuario está logueado
  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

   // Manejar inicio de sesión
   onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Por favor, completa todos los campos.');
      return;
    }

    const { nombreUsuario, password } = this.loginForm.value;

    // Verificar si las credenciales son de administrador
    if (nombreUsuario === 'admin@gmail.com' && password === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('loggedInUser', 'Admin');
      this.isLoggedIn = true;
      this.username = 'Admin';
      alert('Inicio de sesión como administrador exitoso');
      this.router.navigate(['/admin']);
      return;
    }

    // Verificar credenciales de usuarios regulares
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      if (user.email === nombreUsuario && user.password === password) {
        this.isLoggedIn = true;
        this.username = user.nombreCompleto;
        localStorage.setItem('sesionActiva', 'true');
        alert('Inicio de sesión exitoso');
        this.router.navigate(['/']);
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } else {
      alert('Usuario no encontrado');
    }
  }
}
