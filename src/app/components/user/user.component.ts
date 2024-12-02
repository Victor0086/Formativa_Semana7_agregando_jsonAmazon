import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  @ViewChild('logoutModal') logoutModal: ElementRef | undefined;

  email: string = 'elpandacomida@gmail.com';
  userRegistrationForm!: FormGroup;
  loginForm!: FormGroup;
  username: string | null = null;
  isLoggedIn: boolean = false;
  purchases: any[] = [];
  cartCount: number = 0;
  alertMessage: string | null = null;
  alertType: string = '';

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('Inicializando componente User...');
    this.initForms(); 
    this.checkUserSession(); 
    this.loadPurchases(); 
    this.loadCartCount();

    if (this.isBrowser()) {
      window.addEventListener('storage', this.syncSession.bind(this)); // Sincronizar sesión entre pestañas
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser()) {
      window.removeEventListener('storage', this.syncSession.bind(this)); // Eliminar listeners al destruir componente
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initForms(): void {
    this.userRegistrationForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.validarDominioCorreo]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.validarEdad(13, 100)]],
      direccion: [''],
    });

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

      console.log('Estado de sesión en user.component:', { username: this.username, isLoggedIn: this.isLoggedIn });
    }
  }

  private syncSession(event: StorageEvent): void {
    if (event.key === 'sesionActiva' || event.key === 'userData') {
      this.checkUserSession();
    }
  }
  



  logout(): void {
    if (this.isBrowser()) {
      localStorage.setItem('sesionActiva', 'false');
      this.username = null;
      this.isLoggedIn = false;
      window.dispatchEvent(new Event('storage')); 
      this.showNotification('logoutModal'); 
    }
  }

  private loadPurchases(): void {
    if (this.isBrowser()) {
      const storedPurchases = localStorage.getItem('purchases');
      this.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
    }
  }

  private loadCartCount(): void {
    if (this.isBrowser()) {
      const cart = localStorage.getItem('cart');
      try {
        const parsedCart = cart ? JSON.parse(cart) : [];
        this.cartCount = parsedCart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
        this.cartCount = 0;
      }
    }
  }

  validarDominioCorreo(control: any) {
    const email = control.value;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email) ? null : { dominioInvalido: true };
  }

  validarEdad(minEdad: number, maxEdad: number) {
    return (control: any) => {
      const fechaNacimiento = new Date(control.value);
      if (isNaN(fechaNacimiento.getTime())) {
        return { fechaInvalida: true };
      }
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear() - (hoy < new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate()) ? 1 : 0);
      return edad >= minEdad && edad <= maxEdad ? null : { edadInvalida: true };
    };
  }

  onFieldTouched(fieldName: string): void {
    const control = this.userRegistrationForm.get(fieldName);
    if (control) {
      control.markAsTouched();
    }
  }

  submitForm(): void {
    if (this.userRegistrationForm.invalid) {
      this.userRegistrationForm.markAllAsTouched();
      return;
    }

    const formValues = this.userRegistrationForm.value;
    localStorage.setItem('userData', JSON.stringify(formValues));
    this.showAlert('Registro exitoso', 'success');
    this.router.navigate(['/']);
  }

  private showNotification(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
  
    const loginValues = this.loginForm.value;
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const storedUser = JSON.parse(storedUserData);
      if (
        storedUser.email === loginValues.nombreUsuario &&
        storedUser.password === loginValues.password
      ) {
        localStorage.setItem('sesionActiva', 'true');
        this.username = storedUser.nombreCompleto;
        this.isLoggedIn = true;
        window.dispatchEvent(new Event('storage'));
        this.showNotification('successModal'); // Mostrar modal de éxito
        this.router.navigate(['/']);
      } else {
        this.showNotification('logoutModal'); // Reutilizar modal para mostrar error
      }
    } else {
      this.showNotification('logoutModal'); // Reutilizar modal para mostrar error
    }
  }
  

  isUserLoggedIn(): boolean {
    return this.isLoggedIn;
  }

  private showAlert(message: string, type: string): void {
    this.alertMessage = message;
    this.alertType = type;

    setTimeout(() => {
      this.alertMessage = null;
    }, 5000); // Ocultar el mensaje después de 5 segundos
  }
}
