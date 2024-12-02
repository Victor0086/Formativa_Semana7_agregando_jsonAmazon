import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 2d4b8422-c7f4-4b1d-8b73-439bba7af688'
    })
  }

  private jsonUrl = 'https://bucketmascotas.s3.us-east-1.amazonaws.com/personas.json'; 

  private lista:any;

  constructor(private http: HttpClient) {
    console.log('JsonService instanciado');
  }

  getJsonData(): Observable<any> {
    return this.http.get(this.jsonUrl);
  }

  MetodoPersona(listaPersonas:any) {
    console.log(listaPersonas);
    this.http.post(this.jsonUrl,listaPersonas,this.httpOptions).subscribe(
      response => {
        console.log('Archivo JSON sobrescrito con exito', response);
      },
      error => {
        console.error('Error al sobrescribir el archivo JSON', error);
      })
  }

  getCarritoData(): Observable<any> {
    const carritoUrl = 'https://bucketmascotas.s3.us-east-1.amazonaws.com/carrito.json';
    return this.http.get(carritoUrl);
  }
  
}