import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Propriedade, TipoTipologia } from '../../models/propriedade.model';
import { WebDiskService } from '../../services/google-drive';
import { PropriedadeService } from '../../services/propriedade';

@Component({
  selector: 'app-propriedade-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './propriedade.html',
  styleUrl: './propriedade.css',
})
export class PropriedadeCrudComponent implements OnInit {
  propriedades = signal<Propriedade[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  driveUploadStatus = signal('');
  isUploadingImages = signal(false);

  tipologias: TipoTipologia[] = ['T1', 'T2', 'T3', 'T4', 'V1', 'V2', 'V3', 'V4', 'Outro(a)'];

  propriedadeForm: FormGroup;

  showError(controlName: string): string | null {
    const control = this.propriedadeForm.get(controlName);

    if (!control || !(control.touched || control.dirty)) {
      return null;
    }

    if (control.errors?.['required']) {
      return 'Este campo é obrigatório.';
    }

    if (control.errors?.['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['min']) {
      return `O valor mínimo é ${control.errors['min'].min}.`;
    }

    if (control.errors?.['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    return 'Valor inválido.';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly propriedadeService: PropriedadeService,
    private readonly webDiskService: WebDiskService
  ) {
    this.propriedadeForm = this.fb.group({
      item: ['', [Validators.required, Validators.minLength(3)]],
      tipologia: ['T1', [Validators.required]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      preco: [0, [Validators.required, Validators.min(0.01)]],
      imagens: ['', [Validators.maxLength(500)]],
      provincia: ['', [Validators.required, Validators.minLength(2)]],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      referencia: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.loadPropriedades();
  }

  private loadPropriedades(): void {
    this.isLoading.set(true);
    this.propriedadeService.listar$().subscribe({
      next: (list) => {
        this.propriedades.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar propriedades:', err);
        this.isLoading.set(false);
      },
    });
  }

  getImageUrls(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(',')
      .map((imageUrl) => imageUrl.trim())
      .filter((imageUrl) => !!imageUrl);
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.driveUploadStatus.set('');
    this.propriedadeForm.reset({
      item: '',
      tipologia: 'T1',
      descricao: '',
      preco: 0,
      imagens: '',
      provincia: '',
      bairro: '',
      rua: '',
      referencia: '',
    });
  }

  openEditForm(propriedade: Propriedade): void {
    this.isEditing.set(true);
    this.editingId.set(propriedade.id);
    this.driveUploadStatus.set('');
    this.propriedadeForm.patchValue({
      item: propriedade.item,
      tipologia: propriedade.tipologia,
      descricao: propriedade.descricao,
      preco: propriedade.preco,
      imagens: propriedade.imagens?.join(', ') ?? '',
      provincia: propriedade.localizacao?.provincia ?? '',
      bairro: propriedade.localizacao?.bairro ?? '',
      rua: propriedade.localizacao?.rua ?? '',
      referencia: propriedade.localizacao?.referencia ?? '',
    });
  }

  async uploadImagesToWebDisk(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.isUploadingImages.set(true);
    this.driveUploadStatus.set('A enviar imagens para o WebDisk...');

    try {
      const uploadedUrls = await this.webDiskService.uploadFiles(files);
      const existingUrls = (this.propriedadeForm.get('imagens')?.value ?? '')
        .split(',')
        .map((value: string) => value.trim())
        .filter(Boolean);

      const mergedUrls = [...new Set([...existingUrls, ...uploadedUrls])];
      this.propriedadeForm.patchValue({ imagens: mergedUrls.join(', ') });
      this.driveUploadStatus.set(`${uploadedUrls.length} imagem(ns) carregada(s) com sucesso no WebDisk.`);
    } catch (error) {
      console.error('Erro ao enviar imagens para o WebDisk:', error);
      this.driveUploadStatus.set(
        error instanceof Error ? error.message : 'Não foi possível enviar as imagens para o WebDisk.'
      );
    } finally {
      this.isUploadingImages.set(false);
      input.value = '';
    }
  }

  async save(): Promise<void> {
    if (this.propriedadeForm.invalid) {
      this.propriedadeForm.markAllAsTouched();
      return;
    }

    const confirmMessage = this.isEditing() ? 'Deseja confirmar as alterações desta propriedade?' : 'Deseja salvar esta propriedade?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.propriedadeForm.getRawValue();

    const payload = {
      item: formValue.item.trim(),
      tipologia: formValue.tipologia as TipoTipologia,
      descricao: formValue.descricao.trim(),
      preco: Number(formValue.preco),
      imagens: (formValue.imagens || '')
        .split(',')
        .map((img: string) => img.trim())
        .filter(Boolean),
      localizacao: {
        provincia: formValue.provincia.trim(),
        bairro: formValue.bairro.trim(),
        rua: formValue.rua.trim(),
        referencia: formValue.referencia.trim(),
      },
    };

    try {
      const id = this.editingId();
      if (id) {
        await this.propriedadeService.atualizar(id, payload);
      } else {
        await this.propriedadeService.criar(payload);
      }

      this.openCreateForm();
      this.loadPropriedades();
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deletePropriedade(id: string): Promise<void> {
    if (!window.confirm('Deseja realmente excluir esta propriedade?')) {
      return;
    }

    try {
      await this.propriedadeService.excluir(id);
      this.loadPropriedades();
    } catch (error) {
      console.error('Erro ao excluir propriedade:', error);
    }
  }
}
