import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {ResolveFn} from '@angular/router';

export interface Ticket {
  id: number;
  subject: string;
  status: string;
  reporter: {id: number; displayName: string}; // set by the customer
}

export const ticketResolver: ResolveFn<Ticket> = (route) =>
  inject(HttpClient).get<Ticket>(`http://localhost:3000/api/tickets/${route.paramMap.get('id')}`);
