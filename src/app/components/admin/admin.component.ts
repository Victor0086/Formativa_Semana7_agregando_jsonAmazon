import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  trackingForm!: FormGroup;
  adminUser: string | null = null;
  updateMessage: string = '';
  purchases: any[] = [];

  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.checkAdminSession();
    this.initForms();
    this.loadPurchases();
  }

  private checkAdminSession(): void {
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      this.adminUser = localStorage.getItem('loggedInUser') || 'Admin';
    }
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      rol: ['', Validators.required],
    });

    this.trackingForm = this.fb.group({
      trackingNumber: ['', Validators.required],
      orderStatus: ['', Validators.required],
    });
  }

  // Validar inicio de sesión del administrador
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      alert('Por favor, ingresa las credenciales correctamente.');
      return;
    }

    const { username, password } = this.loginForm.value;

    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('loggedInUser', 'Admin');
      this.adminUser = 'Admin';
      alert('Inicio de sesión exitoso como administrador.');
      this.router.navigate(['/admin']);
    } else {
      alert('Nombre de usuario o contraseña incorrectos.');
    }
  }

  // Registrar un nuevo usuario
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formValues = this.registerForm.value;

    if (formValues.password !== formValues.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      nombreCompleto: formValues.nombreCompleto,
      nombreUsuario: formValues.nombreUsuario,
      email: formValues.email,
      password: formValues.password,
      fechaNacimiento: formValues.fechaNacimiento,
      rol: formValues.rol,
    };

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert(`Usuario registrado exitosamente con el rol: ${formValues.rol}`);
    this.registerForm.reset();
  }

  // Actualizar el estado de un pedido
  updateOrderStatus(): void {
    if (this.trackingForm.invalid) {
      this.trackingForm.markAllAsTouched();
      alert('Por favor, completa todos los campos del seguimiento.');
      return;
    }

    const trackingValues = this.trackingForm.value;
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const order = purchases.find(
      (order: any) => order.trackingNumber === trackingValues.trackingNumber
    );

    if (order) {
      order.status = trackingValues.orderStatus;
      localStorage.setItem('purchases', JSON.stringify(purchases));
      this.updateMessage = 'Estado actualizado correctamente.';
    } else {
      this.updateMessage = 'Número de seguimiento no encontrado.';
    }
  }

  redirectToHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  private loadPurchases(): void {
    const storedPurchases = localStorage.getItem('purchases');
    this.purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
  }
}
