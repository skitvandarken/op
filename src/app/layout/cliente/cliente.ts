import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente';
import { NovoCliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.css',
})
export class ClienteFormComponent {
  isSubmitting = signal(false);
  successMessage = signal('');

  clienteForm: FormGroup;

  showError(controlName: string): string | null {
    const control = this.clienteForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'Este campo é obrigatório.';
    }

    if (control.errors?.['email']) {
      return 'Digite um e-mail válido.';
    }

    if (control.errors?.['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['pattern']) {
      return 'Formato inválido.';
    }

    if (control.errors?.['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    return 'Valor inválido.';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly clienteService: ClienteService
  ) {
    this.clienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(6)]],
      telefone: ['', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9+\s()-]{9,}$/)]],
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['Pontual', [Validators.required]],
      observacoes: ['', [Validators.maxLength(250)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    if (!window.confirm('Deseja confirmar o cadastro do cliente?')) {
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set('');

    const value = this.clienteForm.getRawValue();
    const payload: NovoCliente = {
      nome: value.nome.trim(),
      email: value.email.trim(),
      telefone: value.telefone.trim(),
      cidade: value.cidade.trim(),
      bairro: value.bairro.trim(),
      rua: value.rua.trim(),
      tipo: value.tipo,
      observacoes: value.observacoes?.trim() ?? '',
    };

    try {
      await this.clienteService.criar(payload);
      this.clienteForm.reset({
        tipo: 'Pontual',
      });
      this.successMessage.set('Cliente cadastrado com sucesso.');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      this.successMessage.set('Não foi possível cadastrar o cliente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
